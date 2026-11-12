import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { OperatorRole, SUPER_ADMIN_ROLE_ID, buildPermissionMatrix, isForbidden } from '../team.models';
import { TeamService } from '../team.service';

/** Read-only "what can each dashboard role do" reference. Roles are managed by the platform, not per workspace. */
@Component({
    selector: 'proxy-team-roles',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, MatButtonModule, MatIconModule],
    templateUrl: './roles.component.html',
    styleUrl: '../team-tab.scss',
})
export class RolesComponent implements OnInit, OnDestroy {
    private readonly service = inject(TeamService);
    private request?: Subscription;

    protected readonly superAdminId = SUPER_ADMIN_ROLE_ID;
    readonly roles = signal<OperatorRole[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly matrix = computed(() => buildPermissionMatrix(this.roles()));

    ngOnInit(): void {
        this.load();
    }

    ngOnDestroy(): void {
        this.request?.unsubscribe();
    }

    load(refresh = false): void {
        this.request?.unsubscribe();
        this.loading.set(true);
        this.error.set(null);
        this.request = this.service.getRoles(refresh).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (response.hasError || !Array.isArray(response.data?.data)) {
                    this.error.set('Roles could not be loaded. Retry or contact an administrator.');
                    return;
                }
                this.roles.set(response.data.data);
            },
            error: (error: unknown) => {
                this.loading.set(false);
                this.error.set(
                    isForbidden(error)
                        ? 'You do not have permission to view roles in this workspace.'
                        : 'Roles could not be loaded. Check your connection and retry.'
                );
            },
        });
    }
}
