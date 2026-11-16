/**
 * Default state of the dashboard sidebar for a workspace. A workspace without blocks starts with the sidebar collapsed,
 * so the first-run screens (setup wizard, empty blocks list) stay focused. Dependency-free so it can be tested without
 * Angular. Only a successfully loaded, empty block list qualifies: loading, errors and denied reads never change the
 * sidebar, and a workspace is handled once so a user who then opens the sidebar is not fought.
 */

export interface WorkspaceBlockState {
    clientId: number | null;
    status: 'idle' | 'loading' | 'loaded' | 'error' | 'denied';
    /** Total blocks reported by the list API; null until a load succeeds. */
    total: number | null;
}

/** `alreadyHandled` is the workspace this session already applied the rule to (null if none). */
export function shouldCollapseSidebarForEmptyWorkspace(
    workspace: WorkspaceBlockState,
    alreadyHandled: number | null
): boolean {
    return (
        workspace.clientId !== null &&
        workspace.status === 'loaded' &&
        workspace.total === 0 &&
        workspace.clientId !== alreadyHandled
    );
}
