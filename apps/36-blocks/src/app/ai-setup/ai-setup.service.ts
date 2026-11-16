import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, catchError, defer, forkJoin, map, of, tap } from 'rxjs';
import { FeaturesService } from '@proxy/services/proxy/features';
import { RootService } from '@proxy/services/proxy/root';
import { ProxyAuthScriptUrl } from '@proxy/models/features-model';
import { environment } from '../../environments/environment';
import { AiPromptKind, BlockPromptContext, resolvePrompt } from './ai-prompts';
import { BlockListStatus, MANUAL_CREATE_ROUTE, SETUP_ROUTE, readSkipped, writeSkipped } from './setup-redirect';
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

/** Data for the "Set up with AI" dialog. The prompt never contains a credential. */
export interface SetupDialogData {
    kind: AiPromptKind;
    prompt: string;
}

function isDenied(error: unknown): boolean {
    const e = error as { status?: number; errorCode?: number } | null;
    return e?.status === 403 || e?.errorCode === 403;
}

/**
 * Shared state for the "Set up with AI" feature: which block (if any) the current page is about, whether the workspace
 * has blocks (read by the zero-blocks route guard), and opening the dialog. The wizard and the dialog components are
 * loaded lazily. Nothing here holds a credential: the AI agent signs in through the MCP server's browser authorization.
 */
@Injectable({ providedIn: 'root' })
export class AiSetupService {
    private readonly dialog = inject(MatDialog);
    private readonly router = inject(Router);
    private readonly featuresService = inject(FeaturesService);
    private readonly rootService = inject(RootService);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    private readonly blockContext = signal<BlockContext | null>(null);
    readonly workspace = signal<WorkspaceBlocks>({ clientId: null, status: 'idle', total: null });

    readonly block = computed(() => {
        const block = this.blockContext();
        return block ? { ...block, scriptUrl: ProxyAuthScriptUrl(environment.proxyServer) } : null;
    });
    readonly resolved = computed(() => resolvePrompt({ block: this.block() }));

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

    /**
     * Forgets the remembered workspace and block context. Called on sign-in and sign-out so a different user or client
     * is never answered from the previous one's block count (a session expiry navigates without reloading the page).
     */
    resetWorkspace(): void {
        this.workspace.set({ clientId: null, status: 'idle', total: null });
        this.blockContext.set(null);
    }

    /** Called by the dashboard layout once the active workspace is known (and again if it changes). */
    setWorkspace(clientId: number): void {
        if (this.workspace().clientId === clientId) return;
        this.workspace.set({ clientId, status: 'idle', total: null });
        this.refresh().subscribe();
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
            catchError(
                (error: unknown): Observable<BlockListResult> =>
                    of(isDenied(error) ? { status: 'denied' } : { status: 'error' })
            )
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
                })
            );
        });
    }

    /**
     * For the zero-blocks route guard: the active workspace and whether it has blocks, read before any dashboard page
     * renders. A workspace already known to have blocks is answered from memory (a switch reloads the page, so the
     * cache never outlives a workspace). Otherwise the current workspace and its block count are read together. A failed
     * or denied read resolves with that status and never with a total, so the guard cannot mistake it for "no blocks".
     */
    resolveWorkspace(): Observable<WorkspaceBlocks> {
        const known = this.workspace();
        if (known.clientId !== null && known.status === 'loaded' && (known.total ?? 0) > 0) return of(known);
        return forkJoin({
            settings: this.rootService.getClientSettings().pipe(
                map((res) => (res?.hasError ? null : (res?.data?.client?.id ?? null))),
                catchError(() => of(null))
            ),
            blocks: this.fetchBlocks(1),
        }).pipe(
            map(({ settings, blocks }): WorkspaceBlocks => {
                if (settings === null) return { clientId: null, status: 'error', total: null };
                return blocks.status === 'loaded'
                    ? { clientId: settings, status: 'loaded', total: blocks.total }
                    : { clientId: settings, status: blocks.status, total: null };
            }),
            tap((workspace) => this.workspace.set(workspace))
        );
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

    /** True when the user chose to skip the wizard for the current workspace in this tab. */
    isSkipped(): boolean {
        const clientId = this.workspace().clientId;
        return clientId !== null && readSkipped(clientId);
    }

    /**
     * "Skip, I'll set up manually": remembered for this workspace and this tab only, so the zero-blocks guard does not
     * send the user straight back. A new tab or session offers the wizard again while the workspace has no blocks.
     */
    skipForNow(): void {
        const clientId = this.workspace().clientId;
        if (clientId !== null) writeSkipped(clientId);
    }

    /** Skip and open the manual create-block page (which the guard never redirects away from). */
    async setUpManually(): Promise<void> {
        this.skipForNow();
        await this.router.navigateByUrl(MANUAL_CREATE_ROUTE);
    }

    private async openDialog(resolved = this.resolved()): Promise<void> {
        if (!this.isBrowser) return;
        const { SetupWithAiDialogComponent } = await import('./setup-with-ai-dialog/setup-with-ai-dialog.component');
        const data: SetupDialogData = { kind: resolved.kind, prompt: resolved.prompt };
        this.dialog.open(SetupWithAiDialogComponent, {
            data,
            width: '640px',
            maxWidth: '96vw',
            autoFocus: '.ai-copy-button',
            restoreFocus: true,
        });
    }

    private patch(change: Partial<WorkspaceBlocks>): void {
        this.workspace.update((current) => ({ ...current, ...change }));
    }
}
