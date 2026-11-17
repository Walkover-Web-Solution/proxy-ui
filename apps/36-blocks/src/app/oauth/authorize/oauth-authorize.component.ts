import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    Injector,
    PLATFORM_ID,
    afterNextRender,
    inject,
    signal,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Title } from '@angular/platform-browser';
import { IClient } from '@proxy/models/root-models';
import { RootService } from '@proxy/services/proxy/root';
import { Subscription } from 'rxjs';
import { CreateWorkspaceDialogComponent } from '../../panel/layout/create-workspace-dialog/create-workspace-dialog.component';
import { errorMessages, isForbidden } from '../../panel/team/team.models';
import {
    AuthorizeParams,
    ReadyConsent,
    classifyAuthorizeResponse,
    classifyRequestFailure,
    invalidRequestMessage,
    parseAuthorizeRequest,
    safeRedirectTarget,
} from '../oauth-consent';
import { OAuthDecisionAction } from '../oauth.models';
import { OAuthService } from '../oauth.service';

type View =
    | { kind: 'loading' }
    | { kind: 'invalid'; message: string }
    | { kind: 'error'; message: string }
    | { kind: 'denied' }
    | { kind: 'no-workspace'; clientName: string }
    | { kind: 'ready'; consent: ReadyConsent }
    | { kind: 'done'; action: OAuthDecisionAction; returned: boolean };

type WorkspaceList = { status: 'idle' | 'loading' | 'error' | 'loaded'; items: IClient[] };

/**
 * `/oauth/authorize`: where an AI tool's MCP connection asks the signed-in operator for access. The request comes from
 * the page URL; the server validates it. An invalid request is shown as an error and the browser is never sent to the
 * requested redirect URI. Approving or denying posts the decision and then sends the browser to the `redirect_to` the
 * server returns (only if it is an http(s) URL). That URL carries the authorization code, so it is kept in memory only,
 * never logged, stored or used as a link target.
 */
@Component({
    selector: 'proxy-oauth-authorize',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
    templateUrl: './oauth-authorize.component.html',
    styleUrl: './oauth-authorize.component.scss',
})
export class OAuthAuthorizeComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly oauth = inject(OAuthService);
    private readonly rootService = inject(RootService);
    private readonly dialog = inject(MatDialog);
    private readonly title = inject(Title);
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    protected readonly view = signal<View>({ kind: 'loading' });
    /** The decision being sent; both buttons are disabled while it is set. */
    protected readonly busy = signal<OAuthDecisionAction | null>(null);
    protected readonly decisionError = signal<string | null>(null);
    protected readonly switchOpen = signal(false);
    protected readonly workspaces = signal<WorkspaceList>({ status: 'idle', items: [] });
    protected readonly switchingTo = signal<number | null>(null);
    protected readonly switchError = signal<string | null>(null);

    private params: AuthorizeParams | null = null;
    private pendingRedirect: string | null = null;
    private request?: Subscription;
    private listRequest?: Subscription;

    constructor() {
        this.title.setTitle('Connect an AI tool - 36Blocks');
        this.destroyRef.onDestroy(() => {
            this.request?.unsubscribe();
            this.listRequest?.unsubscribe();
            this.pendingRedirect = null;
        });
        if (!this.isBrowser) return;
        const parsed = parseAuthorizeRequest((key) => this.route.snapshot.queryParamMap.get(key));
        if (parsed.ok === false) {
            this.show({ kind: 'invalid', message: invalidRequestMessage(parsed.reason, parsed.fields) });
            return;
        }
        this.params = parsed.params;
        this.load();
    }

    /** Asks the server to validate the request and tell us which workspace the grant would be pinned to. */
    protected load(): void {
        const params = this.params;
        if (!params) return;
        this.request?.unsubscribe();
        this.decisionError.set(null);
        this.view.set({ kind: 'loading' });
        this.request = this.oauth.authorize(params).subscribe({
            next: (res) => {
                const outcome = classifyAuthorizeResponse(res);
                if (outcome.kind === 'ready') this.show({ kind: 'ready', consent: outcome.consent });
                else if (outcome.kind === 'no-workspace') {
                    this.show(outcome);
                    this.loadWorkspaces();
                } else this.show(outcome);
            },
            error: (error: unknown) => {
                const failure = classifyRequestFailure(error);
                this.show(failure.kind === 'denied' ? { kind: 'denied' } : failure);
            },
        });
    }

    protected decide(action: OAuthDecisionAction): void {
        const params = this.params;
        if (!params || this.busy()) return;
        this.busy.set(action);
        this.decisionError.set(null);
        this.request?.unsubscribe();
        this.request = this.oauth.decide(params, action).subscribe({
            next: (res) => {
                const target = res?.hasError ? null : safeRedirectTarget(res?.data?.redirect_to);
                if (res?.hasError) {
                    this.busy.set(null);
                    this.decisionError.set(errorMessages(res, 'The decision could not be saved. Try again.'));
                    return;
                }
                this.busy.set(null);
                this.pendingRedirect = target;
                this.show({ kind: 'done', action, returned: target !== null });
                // If navigation happens this page unloads; otherwise the "done" view below stays as the fallback.
                this.returnToTool();
            },
            error: (error: unknown) => {
                this.busy.set(null);
                const failure = classifyRequestFailure(error, 'This authorization request is no longer valid.');
                this.decisionError.set(
                    failure.kind === 'denied'
                        ? 'Your role does not allow you to authorize AI tools in this workspace.'
                        : failure.message
                );
            },
        });
    }

    /** Sends the browser back to the AI tool. Safe to repeat; does nothing when the server gave no usable URL. */
    protected returnToTool(): void {
        const target = this.pendingRedirect;
        if (target && this.isBrowser) window.location.assign(target);
    }

    // ---- Workspace -------------------------------------------------------------------------------------------------
    protected toggleSwitch(): void {
        const open = !this.switchOpen();
        this.switchOpen.set(open);
        this.switchError.set(null);
        if (open && this.workspaces().status !== 'loaded') this.loadWorkspaces();
    }

    protected loadWorkspaces(): void {
        this.listRequest?.unsubscribe();
        this.workspaces.set({ status: 'loading', items: [] });
        this.listRequest = this.rootService.getClients({ itemsPerPage: 100, pageNo: 1 }).subscribe({
            next: (res) => {
                const items = res?.data?.data;
                this.workspaces.set(
                    res?.hasError || !Array.isArray(items)
                        ? { status: 'error', items: [] }
                        : { status: 'loaded', items }
                );
            },
            error: () => this.workspaces.set({ status: 'error', items: [] }),
        });
    }

    /**
     * Switches the operator's current workspace, then asks the server again. The request stays in the page URL, so
     * nothing is lost and no reload is needed here.
     */
    protected switchTo(client: IClient): void {
        if (this.switchingTo() !== null) return;
        this.switchingTo.set(client.id);
        this.switchError.set(null);
        this.rootService.switchClient({ client_id: client.id }).subscribe({
            next: (res) => {
                this.switchingTo.set(null);
                if (res?.hasError) {
                    this.switchError.set(errorMessages(res, 'The workspace could not be switched. Try again.'));
                    return;
                }
                this.switchOpen.set(false);
                this.load();
            },
            error: (error: unknown) => {
                this.switchingTo.set(null);
                this.switchError.set(
                    isForbidden(error)
                        ? 'You do not have access to that workspace.'
                        : errorMessages(error, 'The workspace could not be switched. Try again.')
                );
            },
        });
    }

    protected createWorkspace(): void {
        this.dialog
            .open(CreateWorkspaceDialogComponent, {
                panelClass: ['mat-dialog'],
                autoFocus: 'input',
                restoreFocus: true,
            })
            .afterClosed()
            .subscribe((client) => {
                // The API switches the session into the new workspace.
                if (client) this.load();
            });
    }

    private show(view: View): void {
        this.view.set(view);
        afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('h1, h2')?.focus(), {
            injector: this.injector,
        });
    }
}
