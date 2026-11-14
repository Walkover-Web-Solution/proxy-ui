import { Inject, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, catchError, defer, map, of, tap } from 'rxjs';
import { FeaturesService } from '@proxy/services/proxy/features';
import { ProxyAuthScriptUrl } from '@proxy/models/features-model';
import { ProxyBaseUrls } from '@proxy/models/root-models';
import { environment } from '../../environments/environment';
import { AiPromptKind, BlockPromptContext, resolvePrompt } from './ai-prompts';
import { BlockListStatus, SETUP_ROUTE, readDismissed, shouldRedirectToSetup, writeDismissed } from './setup-redirect';
import { BlockSummary } from './setup-block';

export type BlockRef = BlockSummary;

export type BlockListResult =
    | { status: 'loaded'; total: number; blocks: BlockRef[]; first: BlockRef | null }
    | { status: 'error' }
    | { status: 'denied' };

export interface WorkspaceBlocks {
    clientId: number | null;
    status: BlockListStatus;
    total: number | null;
}

export type BlockContext = Omit<BlockPromptContext, 'scriptUrl'>;

/** Data for the "Set up with AI" dialog. `context` is present on a block's own pages. It never contains a key. */
export interface SetupDialogData {
    kind: AiPromptKind;
    prompt: string;
    context?: BlockPromptContext | null;
}

/**
 * Shared state for the "Set up with AI" feature: which block (if any) the current page is about, whether the workspace
 * has blocks, the one-time redirect to the setup wizard and opening the dialog. The wizard and the dialog components
 * are loaded lazily. This root service never holds a workspace key: the components that use one provide their own
 * `SetupKeyService`, which is dropped with them.
 */
@Injectable({ providedIn: 'root' })
export class AiSetupService {
    private readonly dialog = inject(MatDialog);
    private readonly router = inject(Router);
    private readonly featuresService = inject(FeaturesService);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    private readonly blockContext = signal<BlockContext | null>(null);
    readonly workspace = signal<WorkspaceBlocks>({ clientId: null, status: 'idle', total: null });
    /** Workspaces already redirected in this tab, so unavailable storage cannot send the user back on every page. */
    private readonly redirectedThisSession = new Set<number>();

    readonly block = computed(() => {
        const block = this.blockContext();
        return block ? { ...block, scriptUrl: ProxyAuthScriptUrl(environment.proxyServer) } : null;
    });
    readonly resolved = computed(() => resolvePrompt({ block: this.block() }));

    constructor(@Inject(ProxyBaseUrls.BaseURL) private readonly apiBaseUrl: string) {
        // A dialog that was in the way has closed: the redirect may now be allowed.
        this.dialog.afterAllClosed.subscribe(() => this.evaluateRedirect());
    }

    /** Pages for one specific block register it so the dialog uses that block's prompt. */
    setBlockContext(context: BlockContext): void {
        this.blockContext.set(context);
    }

    /** Only clears when `referenceId` still matches, so a page that was replaced cannot clear its successor's context. */
    clearBlockContext(referenceId: string): void {
        if (this.blockContext()?.referenceId === referenceId) this.blockContext.set(null);
    }

    /** True while a specific block's page is open. */
    hasBlockContext(): boolean {
        return this.blockContext() !== null;
    }

    /** The dashboard API base URL, absolute (a relative review-build URL is resolved against the page origin). */
    resolvedApiBaseUrl(): string {
        if (this.isBrowser && this.apiBaseUrl.startsWith('/')) return `${location.origin}${this.apiBaseUrl}`;
        return this.apiBaseUrl;
    }

    /** Called by the dashboard layout once the active workspace is known (and again if it changes). */
    setWorkspace(clientId: number): void {
        if (this.workspace().clientId === clientId) return;
        this.workspace.set({ clientId, status: 'idle', total: null });
        this.refresh().subscribe();
    }

    /** Called on dashboard navigation: while the workspace has no blocks the list is re-checked. */
    onNavigation(): void {
        const workspace = this.workspace();
        if (workspace.status === 'loaded' && workspace.total === 0) this.refresh().subscribe();
        else this.evaluateRedirect();
    }

    /**
     * Reads the block list through the existing list API. `refresh()` asks for one item (enough to know the total); the
     * wizard asks for more so it can compare against a baseline. Does not touch the workspace state by itself.
     */
    fetchBlocks(itemsPerPage: number): Observable<BlockListResult> {
        if (!this.isBrowser) return of({ status: 'error' });
        return this.featuresService.getFeature({ itemsPerPage, pageNo: 1 }).pipe(
            map((res): BlockListResult => {
                const items = res?.data?.data;
                if (res?.hasError || !Array.isArray(items)) return { status: 'error' };
                const blocks = items.map((item) => ({ id: item.id, name: item.name, referenceId: item.reference_id }));
                return {
                    status: 'loaded',
                    total: res.data.totalEntityCount ?? items.length,
                    blocks,
                    first: blocks[0] ?? null,
                };
            }),
            catchError((error: any): Observable<BlockListResult> => {
                const denied = error?.status === 403 || error?.errorCode === 403;
                return of(denied ? { status: 'denied' } : { status: 'error' });
            })
        );
    }

    /** Re-reads the block list for the workspace state (one item is enough to know the total). */
    refresh(): Observable<BlockListResult> {
        if (!this.isBrowser) return of({ status: 'error' });
        return defer(() => {
            const clientId = this.workspace().clientId;
            // Keep showing the last known good answer during background re-checks.
            if (this.workspace().status !== 'loaded') this.patch({ status: 'loading', total: null });
            return this.fetchBlocks(1).pipe(
                tap((result) => {
                    // The workspace changed while the request was in flight: drop the stale answer.
                    if (this.workspace().clientId !== clientId) return;
                    this.patch(
                        result.status === 'loaded'
                            ? { status: 'loaded', total: result.total }
                            : { status: result.status, total: null }
                    );
                    this.evaluateRedirect();
                })
            );
        });
    }

    /**
     * The persistent "Set up with AI" button. On a specific block's page it opens that block's dialog; everywhere else
     * it goes to the setup wizard (which words itself for "add another block" once the workspace has blocks).
     */
    async openSetup(): Promise<void> {
        if (this.hasBlockContext() && this.resolved().kind === 'block') {
            await this.openDialog();
            return;
        }
        await this.goToSetup();
    }

    async goToSetup(): Promise<void> {
        await this.router.navigateByUrl(SETUP_ROUTE);
    }

    /** The public website's button: always the general prompt, no key and no account data. */
    async openGeneral(): Promise<void> {
        await this.openDialog(resolvePrompt({ block: null }));
    }

    /** Marks the wizard as dealt with for this workspace ("Set up manually", "Skip for now", or the redirect itself). */
    dismiss(): void {
        const clientId = this.workspace().clientId;
        if (clientId === null) return;
        this.redirectedThisSession.add(clientId);
        writeDismissed(clientId);
    }

    private async openDialog(resolved = this.resolved()): Promise<void> {
        if (!this.isBrowser) return;
        const { SetupWithAiDialogComponent } = await import('./setup-with-ai-dialog/setup-with-ai-dialog.component');
        const data: SetupDialogData = {
            kind: resolved.kind,
            prompt: resolved.prompt,
            context: resolved.kind === 'block' ? this.block() : null,
        };
        this.dialog.open(SetupWithAiDialogComponent, {
            data,
            width: '640px',
            maxWidth: '96vw',
            autoFocus: '.ai-copy-button',
            restoreFocus: true,
        });
    }

    /** Redirects to the wizard once per workspace when (and only when) every condition holds. Safe to call often. */
    evaluateRedirect(): void {
        if (!this.isBrowser) return;
        const workspace = this.workspace();
        const clientId = workspace.clientId;
        if (
            clientId === null ||
            !shouldRedirectToSetup({
                clientId,
                status: workspace.status,
                total: workspace.total,
                url: this.router.url,
                dismissed: readDismissed(clientId),
                anotherDialogOpen: this.dialog.openDialogs.length > 0,
                alreadyRedirected: this.redirectedThisSession.has(clientId),
            })
        ) {
            return;
        }
        // "Once" means once: record it now, so a reload or a later visit to the dashboard does not redirect again.
        this.dismiss();
        void this.router.navigateByUrl(SETUP_ROUTE);
    }

    private patch(change: Partial<WorkspaceBlocks>): void {
        this.workspace.update((current) => ({ ...current, ...change }));
    }
}
