/**
 * Global window events dispatched by 36Blocks widget clients.
 *
 * Use these constants when dispatching or listening to widget events
 * to avoid typos and provide a single source of truth.
 *
 * Usage (client side):
 *   window.dispatchEvent(new CustomEvent(WidgetEvent.OpenInviteMemberDialog, {
 *     detail: { authToken: 'xxx', theme: 'dark' }
 *   }));
 */
export enum WidgetEvent {
    /**
     * Opens the Invite Member (Add User) dialog.
     * Works whether or not the UserManagement widget is currently mounted.
     *
     * detail: { authToken: string; theme?: 'dark' | 'light' | 'system' }
     */
    OpenInviteMemberDialog = 'openAddUserDialog',
}
