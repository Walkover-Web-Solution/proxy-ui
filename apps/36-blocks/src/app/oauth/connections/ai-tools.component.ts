import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { Subscription } from 'rxjs';
import { errorMessages, isForbidden } from '../../panel/team/team.models';
import { OAuthConnection } from '../oauth.models';
import { OAuthService } from '../oauth.service';

/**
 * "Connected AI tools": the AI tools (MCP connections) that signed in as the current operator, with Revoke. Lives under
 * Team & access because it is operator-level access, next to members, roles and API keys. The list is the operator's own
 * connections; each one is pinned to the workspace it was approved for.
 */
@Component({
    selector: 'proxy-ai-tools',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DatePipe, MatButtonModule, MatIconModule],
    templateUrl: './ai-tools.component.html',
    styleUrl: '../../panel/team/team-tab.scss',
})
export class AiToolsComponent implements OnInit, OnDestroy {
    private readonly service = inject(OAuthService);
    private readonly dialog = inject(MatDialog);
    private readonly toast = inject(PrimeNgToastService);
    private request?: Subscription;
    private revokeRequest?: Subscription;

    readonly connections = signal<OAuthConnection[]>([]);
    readonly loading = signal(false);
    /** Set when the list could not be loaded (retry shown); `denied` is distinct from a failure. */
    readonly error = signal<string | null>(null);
    readonly denied = signal(false);
    readonly revokingId = signal<number | string | null>(null);

    ngOnInit(): void {
        this.load();
    }

    ngOnDestroy(): void {
        this.request?.unsubscribe();
        this.revokeRequest?.unsubscribe();
    }

    load(): void {
        this.request?.unsubscribe();
        this.loading.set(true);
        this.error.set(null);
        this.denied.set(false);
        this.request = this.service.getConnections().subscribe({
            next: (res) => {
                this.loading.set(false);
                if (res.hasError || !Array.isArray(res.data)) {
                    this.error.set('Connected AI tools could not be loaded. Retry or contact an administrator.');
                    return;
                }
                this.connections.set(res.data);
            },
            error: (error: unknown) => {
                this.loading.set(false);
                if (isForbidden(error)) this.denied.set(true);
                else this.error.set('Connected AI tools could not be loaded. Check your connection and retry.');
            },
        });
    }

    scopeText(connection: OAuthConnection): string {
        return Array.isArray(connection.scopes) && connection.scopes.length ? connection.scopes.join(', ') : '-';
    }

    confirmRevoke(connection: OAuthConnection): void {
        if (this.revokingId() !== null) return;
        const ref = this.dialog.open(ConfirmDialogComponent, { panelClass: ['mat-dialog'] });
        ref.componentRef.setInput(
            'confirmationMessage',
            `Revoke access for ${connection.client_name}? It stops working right away and can no longer change ${
                connection.workspace?.name ?? 'your workspace'
            }. The tool can ask for access again later.`
        );
        ref.componentRef.setInput('confirmButtonText', 'Revoke access');
        ref.componentRef.setInput('confirmButtonColor', 'warn');
        ref.afterClosed().subscribe((action) => {
            if (action === 'yes') this.revoke(connection);
        });
    }

    private revoke(connection: OAuthConnection): void {
        this.revokingId.set(connection.id);
        this.revokeRequest = this.service.revokeConnection(connection.id).subscribe({
            next: (res) => {
                this.revokingId.set(null);
                if (res.hasError || res.data?.revoked !== true) {
                    this.toast.error(errorMessages(res, 'The connection could not be revoked. Try again.'));
                    return;
                }
                this.connections.update((list) => list.filter((item) => item.id !== connection.id));
                this.toast.success(`${connection.client_name} was disconnected.`);
            },
            error: (error: unknown) => {
                this.revokingId.set(null);
                this.toast.error(
                    isForbidden(error)
                        ? 'Your role does not allow this action.'
                        : errorMessages(error, 'The connection could not be revoked. Try again.')
                );
            },
        });
    }
}
