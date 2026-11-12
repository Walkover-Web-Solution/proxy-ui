import { DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    computed,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store, select } from '@ngrx/store';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { Subscription } from 'rxjs';
import { selectLogInData } from '../../../website/home/ngrx/selector/login.selector';
import { ILogInFeatureStateWithRootState } from '../../../website/home/ngrx/store/login.state';
import {
    INVITE_EXPIRY_MINUTES,
    OperatorRole,
    TeamMember,
    assignableRoles,
    errorMessages,
    isForbidden,
    memberDisplayName,
    memberStatus,
} from '../team.models';
import { TeamService } from '../team.service';

/**
 * Operators of the current workspace: invite people, see their invitation state and change their role.
 * Server authorization is authoritative; the UI only prevents obviously invalid attempts (own role, Super admin).
 */
@Component({
    selector: 'proxy-team-members',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DatePipe,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTooltipModule,
    ],
    templateUrl: './members.component.html',
    styleUrl: '../team-tab.scss',
})
export class MembersComponent implements OnInit, OnDestroy {
    private readonly service = inject(TeamService);
    private readonly dialog = inject(MatDialog);
    private readonly toast = inject(PrimeNgToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly store = inject<Store<ILogInFeatureStateWithRootState>>(Store);
    private membersRequest?: Subscription;
    private rolesRequest?: Subscription;
    private saveRequest?: Subscription;
    private dialogRef: MatDialogRef<unknown> | null = null;

    @ViewChild('inviteDialog', { static: true }) inviteDialog!: TemplateRef<unknown>;
    @ViewChild('roleDialog', { static: true }) roleDialog!: TemplateRef<unknown>;

    protected readonly inviteExpiryMinutes = INVITE_EXPIRY_MINUTES;
    protected readonly memberStatus = memberStatus;
    protected readonly memberDisplayName = memberDisplayName;

    searchText = '';
    private readonly appliedSearch = signal('');

    readonly members = signal<TeamMember[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly page = signal(1);
    readonly totalPages = signal(0);
    readonly total = signal(0);

    readonly roles = signal<OperatorRole[]>([]);
    readonly rolesLoading = signal(false);
    readonly rolesFailed = signal(false);
    readonly assignable = computed(() => assignableRoles(this.roles()));

    readonly myEmail = signal('');
    readonly saving = signal(false);
    readonly dialogError = signal<string | null>(null);
    readonly resendingId = signal<number | null>(null);
    readonly roleTarget = signal<TeamMember | null>(null);
    readonly hasFilter = computed(() => this.appliedSearch().length > 0);

    readonly inviteForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(254)]),
        role_id: new FormControl<number | null>(null, [Validators.required]),
    });
    readonly roleForm = new FormGroup({
        role_id: new FormControl<number | null>(null, [Validators.required]),
    });

    constructor() {
        this.store
            .pipe(select(selectLogInData), takeUntilDestroyed())
            .subscribe((user) => this.myEmail.set((user?.email ?? '').trim().toLowerCase()));
    }

    ngOnInit(): void {
        this.load(1);
        this.loadRoles();
    }

    ngOnDestroy(): void {
        this.membersRequest?.unsubscribe();
        this.rolesRequest?.unsubscribe();
        this.saveRequest?.unsubscribe();
    }

    isMe(member: TeamMember): boolean {
        return !!this.myEmail() && member.email.trim().toLowerCase() === this.myEmail();
    }

    roleName(member: TeamMember): string {
        return member.client_user?.role?.role_name ?? 'Not assigned';
    }

    applySearch(): void {
        this.appliedSearch.set(this.searchText.trim());
        this.load(1);
    }

    clearSearch(): void {
        this.searchText = '';
        this.applySearch();
    }

    load(page: number): void {
        this.membersRequest?.unsubscribe();
        this.loading.set(true);
        this.error.set(null);
        this.page.set(page);
        this.membersRequest = this.service.getMembers({ name: this.appliedSearch(), pageNo: page }).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (response.hasError || !response.data || !Array.isArray(response.data.data)) {
                    this.members.set([]);
                    this.error.set('Team members could not be loaded. Retry or contact an administrator.');
                    return;
                }
                this.members.set(response.data.data);
                this.total.set(response.data.totalEntityCount ?? response.data.data.length);
                this.totalPages.set(response.data.totalPageCount ?? 1);
            },
            error: (error: unknown) => {
                this.loading.set(false);
                this.members.set([]);
                this.error.set(
                    isForbidden(error)
                        ? 'You do not have permission to view the team of this workspace. Ask a workspace Owner or Admin.'
                        : 'Team members could not be loaded. Check your connection and retry.'
                );
            },
        });
    }

    loadRoles(refresh = false): void {
        this.rolesRequest?.unsubscribe();
        this.rolesLoading.set(true);
        this.rolesFailed.set(false);
        this.rolesRequest = this.service.getRoles(refresh).subscribe({
            next: (response) => {
                this.rolesLoading.set(false);
                if (response.hasError || !Array.isArray(response.data?.data)) {
                    this.rolesFailed.set(true);
                    return;
                }
                this.roles.set(response.data.data);
            },
            error: () => {
                this.rolesLoading.set(false);
                this.rolesFailed.set(true);
            },
        });
    }

    openInvite(): void {
        if (this.dialogRef) return;
        const defaultRole = this.assignable().find((role) => role.role_name.trim().toLowerCase() === 'user');
        this.inviteForm.reset({ email: '', role_id: defaultRole?.id ?? null });
        this.openDialog(this.inviteDialog);
    }

    submitInvite(): void {
        if (this.saving()) return;
        if (this.inviteForm.invalid) {
            this.inviteForm.markAllAsTouched();
            return;
        }
        const { email, role_id } = this.inviteForm.getRawValue();
        this.runSave(
            this.service.inviteMember({ email: email!.trim(), role_id: role_id! }),
            `Invitation sent to ${email!.trim()}. The link is valid for ${INVITE_EXPIRY_MINUTES} minutes.`,
            'The invitation could not be sent. Check the email address and your permissions, then retry.'
        );
    }

    resend(member: TeamMember): void {
        const roleId = member.client_user?.role?.id;
        if (this.resendingId() !== null || !roleId) return;
        this.resendingId.set(member.id);
        this.service.inviteMember({ email: member.email, role_id: roleId }).subscribe({
            next: (response) => {
                this.resendingId.set(null);
                if (response.hasError) {
                    this.toast.error(errorMessages(response, 'The invitation could not be sent again.'));
                    return;
                }
                this.toast.success(`Invitation sent again to ${member.email}.`);
                this.load(this.page());
            },
            error: (error: unknown) => {
                this.resendingId.set(null);
                this.toast.error(errorMessages(error, 'The invitation could not be sent again.'));
            },
        });
    }

    openRoleChange(member: TeamMember): void {
        if (this.dialogRef || this.isMe(member)) return;
        this.roleTarget.set(member);
        const current = member.client_user?.role?.id ?? null;
        this.roleForm.reset({ role_id: this.assignable().some((role) => role.id === current) ? current : null });
        this.openDialog(this.roleDialog);
    }

    submitRoleChange(): void {
        const target = this.roleTarget();
        if (!target || this.saving()) return;
        if (this.roleForm.invalid) {
            this.roleForm.markAllAsTouched();
            return;
        }
        const roleId = this.roleForm.getRawValue().role_id!;
        if (roleId === target.client_user?.role?.id) {
            this.dialogError.set('That is already this person’s role.');
            return;
        }
        this.runSave(
            this.service.updateMemberRole({ user_id: target.id, role_id: roleId }),
            `${memberDisplayName(target)}’s role was updated.`,
            'The role could not be changed. You may not have permission to change roles in this workspace.'
        );
    }

    closeDialog(): void {
        this.dialogRef?.close();
    }

    private runSave(
        request: ReturnType<TeamService['inviteMember']>,
        successMessage: string,
        failureMessage: string
    ): void {
        this.saving.set(true);
        this.dialogError.set(null);
        if (this.dialogRef) this.dialogRef.disableClose = true;
        this.saveRequest = request.subscribe({
            next: (response) => {
                this.finishSave();
                if (response.hasError) {
                    this.dialogError.set(errorMessages(response, failureMessage));
                    return;
                }
                this.toast.success(successMessage);
                this.closeDialog();
                this.load(this.page());
            },
            error: (error: unknown) => {
                this.finishSave();
                this.dialogError.set(
                    isForbidden(error)
                        ? 'Your role does not allow this action. Ask a workspace Owner or Admin.'
                        : errorMessages(error, failureMessage)
                );
            },
        });
    }

    private finishSave(): void {
        this.saving.set(false);
        if (this.dialogRef) this.dialogRef.disableClose = false;
    }

    private openDialog(template: TemplateRef<unknown>): void {
        this.dialogError.set(null);
        this.dialogRef = this.dialog.open(template, {
            panelClass: ['mat-dialog'],
            hasBackdrop: true,
            autoFocus: 'input',
            restoreFocus: true,
        });
        this.dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.dialogRef = null;
                this.roleTarget.set(null);
                this.dialogError.set(null);
            });
    }
}
