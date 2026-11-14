import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    Injector,
    OnInit,
    PLATFORM_ID,
    afterNextRender,
    computed,
    inject,
    signal,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';
import { FeaturesService } from '@proxy/services/proxy/features';
import { catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap, tap } from 'rxjs';
import {
    BLOCK_NAME_MAX,
    BLOCK_NAME_MIN,
    blockNameMessage,
    buildSetupPrompt,
    checkBlockName,
    maskKeyInPrompt,
} from '../ai-prompts';
import { AiSetupService } from '../ai-setup.service';
import { AiSetupPanelComponent } from '../ai-setup-panel/ai-setup-panel.component';
import { BlockBaseline, BlockSummary, blockNameTaken, detectNewBlock, makeBaseline } from '../setup-block';
import { PROVISION_FAILURE_TEXT, SetupKeyService } from '../setup-key.service';
import { PERMISSION_CREATE_KEY, PERMISSION_VIEW_KEYS, SETUP_KEY_NAME } from '../setup-key';

export type WizardStep = 1 | 2 | 3;
export type WaitPhase = 'waiting' | 'found';
export type NameLookup = 'idle' | 'checking' | 'taken' | 'free';

/** How often the block list is re-checked while waiting, and how many checks are made before stopping. */
export const WAIT_POLL_MS = 15_000;
export const WAIT_MAX_CHECKS = 40;
/** Enough to compare against a baseline without paging; the wizard never needs a full list. */
const BLOCK_LIST_SIZE = 100;

const STEPS: { n: WizardStep; label: string }[] = [
    { n: 1, label: 'Name your block' },
    { n: 2, label: 'Give this to your AI' },
    { n: 3, label: 'Wait for it' },
];

/**
 * The AI setup wizard (`/app/setup`). Step 1 names the block, step 2 creates (or reuses) the dedicated workspace key
 * and shows the prompt, step 3 watches for the block the agent creates. Nothing is created before the explicit click in
 * step 2, the wizard never creates the block itself, and the key lives only in `SetupKeyService`, which is provided here
 * and so is dropped when the user leaves the page.
 */
@Component({
    selector: 'proxy-setup-wizard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        RouterLink,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        AiSetupPanelComponent,
    ],
    providers: [SetupKeyService],
    templateUrl: './setup-wizard.component.html',
    styleUrl: './setup-wizard.component.scss',
})
export class SetupWizardComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);
    private readonly aiSetup = inject(AiSetupService);
    private readonly featuresService = inject(FeaturesService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    protected readonly keys = inject(SetupKeyService);

    protected readonly steps = STEPS;
    protected readonly nameMin = BLOCK_NAME_MIN;
    protected readonly nameMax = BLOCK_NAME_MAX;
    protected readonly keyName = SETUP_KEY_NAME;
    protected readonly failureText = PROVISION_FAILURE_TEXT;
    protected readonly neededPermissions = [PERMISSION_CREATE_KEY, PERMISSION_VIEW_KEYS];

    protected readonly step = signal<WizardStep>(1);
    protected readonly phase = signal<WaitPhase>('waiting');

    /** "Add another block" wording once the workspace is known to have blocks. */
    protected readonly another = computed(() => {
        const workspace = this.aiSetup.workspace();
        return workspace.status === 'loaded' && (workspace.total ?? 0) > 0;
    });

    // ---- Step 1: name ----------------------------------------------------------------------------------------------
    protected readonly name = new FormControl('', { nonNullable: true });
    private readonly nameValue = toSignal(this.name.valueChanges, { initialValue: '' });
    protected readonly check = computed(() => checkBlockName(this.nameValue()));
    protected readonly showNameError = signal(false);
    protected readonly nameError = computed(() => (this.showNameError() ? blockNameMessage(this.check().problem) : ''));
    protected readonly lookup = signal<NameLookup>('idle');

    // ---- Step 2: key + prompt --------------------------------------------------------------------------------------
    /** The chosen name, fixed when the user leaves step 1. */
    protected readonly blockName = signal('');
    /** The prompt that includes the key. Memory only; never logged, stored or put in a URL. */
    private readonly keyedPrompt = signal<string | null>(null);
    protected readonly hasPrompt = computed(() => this.keyedPrompt() !== null);
    protected readonly revealed = signal(false);
    protected readonly copyPrompt = computed(() => this.keyedPrompt() ?? '');
    protected readonly shownPrompt = computed(() => {
        const prompt = this.keyedPrompt();
        if (prompt === null || this.revealed()) return prompt ?? '';
        return maskKeyInPrompt(prompt, this.keys.authKey() ?? '');
    });
    protected readonly promptUnavailable = signal(false);

    // ---- Step 3: waiting, then found -------------------------------------------------------------------------------
    protected readonly checking = signal(false);
    protected readonly checkFailed = signal(false);
    /** True once automatic checking has stopped (maximum reached); the user can still press "Check again". */
    protected readonly pollingStopped = signal(false);
    protected readonly found = signal<{ block: BlockSummary; renamed: boolean } | null>(null);
    protected readonly blockLink = computed(() => {
        const found = this.found();
        return found ? ['/app', 'features', 'manage', found.block.id] : null;
    });
    protected readonly previewLink = computed(() => {
        const found = this.found();
        return found?.block.referenceId ? ['/widget-preview', found.block.referenceId] : null;
    });
    private baseline: BlockBaseline | null = null;
    private pollTimer: ReturnType<typeof setInterval> | undefined;
    private checksMade = 0;
    private readonly onVisibilityChange = () => {
        if (this.pollTimer !== undefined && !document.hidden) this.tick();
    };
    private revokeDialog: MatDialogRef<unknown> | null = null;

    constructor() {
        this.destroyRef.onDestroy(() => this.stopPolling());
        // Best effort: warn when a block with this name already exists. The server stays the authority.
        this.name.valueChanges
            .pipe(
                startWith(this.name.value),
                map((value) => checkBlockName(value)),
                tap((check) => this.lookup.set(check.valid ? 'checking' : 'idle')),
                debounceTime(450),
                distinctUntilChanged((a, b) => a.value === b.value && a.valid === b.valid),
                switchMap((check) => {
                    if (!check.valid || !this.isBrowser) return of<NameLookup>('idle');
                    return this.featuresService.getFeature({ search: check.value, itemsPerPage: 25, pageNo: 1 }).pipe(
                        map((res): NameLookup => {
                            const items = res?.data?.data;
                            if (res?.hasError || !Array.isArray(items)) return 'idle';
                            const blocks = items.map((item) => ({
                                id: item.id,
                                name: item.name,
                                referenceId: item.reference_id,
                            }));
                            return blockNameTaken(check.value, blocks) ? 'taken' : 'free';
                        }),
                        catchError(() => of<NameLookup>('idle'))
                    );
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((state) => this.lookup.set(state));
    }

    ngOnInit(): void {
        void this.keys.loadPermissions();
    }

    // ---- Navigation ------------------------------------------------------------------------------------------------
    /** Switches step and moves focus to the new heading, so keyboard and screen-reader users are not left on a removed control. */
    protected go(step: WizardStep): void {
        this.step.set(step);
        this.focusHeading();
    }

    private focusHeading(): void {
        afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('h2.step-heading')?.focus(), {
            injector: this.injector,
        });
    }

    protected retryPermissions(): void {
        void this.keys.loadPermissions();
    }

    protected setUpManually(): void {
        this.aiSetup.dismiss();
        void this.router.navigate(['/app', 'features', 'create']);
    }

    protected skip(): void {
        this.aiSetup.dismiss();
        void this.router.navigate(['/app', 'dashboard']);
    }

    // ---- Step 1 ----------------------------------------------------------------------------------------------------
    protected submitName(): void {
        const check = this.check();
        if (!check.valid) {
            this.showNameError.set(true);
            this.host.nativeElement.querySelector<HTMLElement>('input')?.focus();
            return;
        }
        // The name changed after a prompt was made: that prompt names the wrong block, so it is dropped.
        if (this.blockName() !== check.value) this.keyedPrompt.set(null);
        this.blockName.set(check.value);
        this.go(2);
    }

    // ---- Step 2 ----------------------------------------------------------------------------------------------------
    /** The one explicit action that creates (or reuses) the key. Nothing is created before this click. */
    protected async createKey(): Promise<void> {
        this.promptUnavailable.set(false);
        if (!this.keys.authKey()) await this.keys.prepare();
        const key = this.keys.authKey();
        if (!key || this.keys.provision() !== 'ready') return;
        const prompt = buildSetupPrompt({
            blockName: this.blockName(),
            baseUrl: this.aiSetup.resolvedApiBaseUrl(),
            authKey: key,
        });
        if (!prompt) {
            this.promptUnavailable.set(true);
            return;
        }
        this.keyedPrompt.set(prompt);
        this.revealed.set(false);
        void this.captureBaseline();
    }

    /** What the workspace had when the prompt was handed out, so the agent's block can be told from the old ones. */
    private async captureBaseline(): Promise<void> {
        this.baseline = null;
        this.aiSetup.fetchBlocks(BLOCK_LIST_SIZE).subscribe((result) => {
            if (result.status === 'loaded') this.baseline = makeBaseline(result.blocks, result.total);
        });
    }

    protected toggleReveal(): void {
        this.revealed.update((value) => !value);
    }

    protected onPromptCopied(): void {
        if (this.step() === 2) this.startWaiting();
    }

    /** For people who copied the prompt by hand: continue without pressing "Copy prompt". */
    protected startWaiting(): void {
        this.phase.set('waiting');
        this.checkFailed.set(false);
        this.pollingStopped.set(false);
        this.go(3);
        this.checkNow();
        this.startPolling();
    }

    // ---- Step 3 ----------------------------------------------------------------------------------------------------
    protected backToPrompt(): void {
        this.stopPolling();
        this.go(2);
    }

    /** Manual re-check. Also restarts automatic checking after it stopped. */
    protected checkAgain(): void {
        this.pollingStopped.set(false);
        this.checkNow();
        this.startPolling();
    }

    private startPolling(): void {
        if (!this.isBrowser) return;
        this.stopPolling();
        this.checksMade = 0;
        this.pollTimer = setInterval(() => this.tick(), WAIT_POLL_MS);
        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    private stopPolling(): void {
        clearInterval(this.pollTimer);
        this.pollTimer = undefined;
        if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }

    private tick(): void {
        // No background requests while the tab is hidden; the visibility listener resumes with an immediate check.
        if (this.step() !== 3 || this.phase() !== 'waiting' || document.hidden) return;
        if (this.checksMade >= WAIT_MAX_CHECKS) {
            this.stopPolling();
            this.pollingStopped.set(true);
            return;
        }
        this.checksMade++;
        this.checkNow();
    }

    private checkNow(): void {
        if (this.checking()) return;
        this.checking.set(true);
        this.aiSetup.fetchBlocks(BLOCK_LIST_SIZE).subscribe((result) => {
            this.checking.set(false);
            if (this.step() !== 3 || this.phase() !== 'waiting') return;
            if (result.status !== 'loaded') {
                // Distinct from "nothing yet": the list could not be read.
                this.checkFailed.set(true);
                return;
            }
            this.checkFailed.set(false);
            const hit = detectNewBlock(this.baseline, result.blocks, result.total, this.blockName());
            if (hit.kind === 'none') return;
            this.stopPolling();
            this.found.set({ block: hit.block, renamed: hit.kind === 'other' });
            this.phase.set('found');
            this.focusHeading();
            // The workspace now has a block: keep the shared state honest for the top bar and the redirect.
            this.aiSetup.refresh().subscribe();
        });
    }

    // ---- Key controls ----------------------------------------------------------------------------------------------
    protected confirmRevoke(): void {
        if (this.revokeDialog || this.keys.revoke() === 'working') return;
        const ref: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        this.revokeDialog = ref;
        ref.componentRef.setInput(
            'confirmationMessage',
            `Revoke the setup key “${this.keys.keyName() ?? SETUP_KEY_NAME}”? It stops working on the next call, so your AI agent can no longer manage blocks with it. You can create a new one later.`
        );
        ref.componentRef.setInput('confirmButtonText', 'Revoke key');
        ref.componentRef.setInput('confirmButtonColor', 'warn');
        ref.afterClosed().subscribe(async (action) => {
            this.revokeDialog = null;
            if (action !== 'yes') return;
            await this.keys.revokeKey();
            // The prompt holds the key: once it is revoked there is nothing useful left to show.
            if (this.keys.revoke() === 'done') this.keyedPrompt.set(null);
        });
    }
}
