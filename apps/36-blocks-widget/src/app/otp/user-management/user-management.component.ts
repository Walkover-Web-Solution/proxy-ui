import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    computed,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
import { WidgetPortalRef, WidgetPortalService } from '../service/widget-portal.service';
import { UserManagementBridgeService } from '../service/user-management-bridge.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../service/toast.service';
import { ToastComponent } from '../service/toast.component';
import { WidgetTheme } from '@proxy/constant';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../store/app.state';
import { otpActions } from '../store/actions';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import {
    addUserData,
    companyUsersData,
    companyUsersDataInProcess,
    permissionCreateData,
    permissionData,
    roleCreateData,
    rolesData,
    updateCompanyUserData,
    updatePermissionData,
    updateRoleData,
    updateUserPermissionData,
    updateUserRoleData,
} from '../store/selectors';
import { isEqual } from 'lodash-es';
import { WidgetThemeService } from '../service/widget-theme.service';
import { UserData, Role, UserManagementTab } from '../model/otp';

interface PageEvent {
    pageIndex: number;
    pageSize: number;
    length: number;
}

@Component({
    selector: 'user-management',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent],
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly userToken = input<string>();
    readonly pass = input<boolean>(false);
    readonly theme = input<string>();
    protected readonly WidgetTheme = WidgetTheme;
    protected readonly UserManagementTab = UserManagementTab;
    protected readonly ariaCurrent = ['p', 'a', 'g', 'e'].join('');
    readonly exclude_role_ids = input<any[]>([]);
    readonly include_role_ids = input<any[]>([]);
    readonly showDialog = signal(false);
    readonly showConfirmDialog = signal(false);
    private readonly themeService = inject(WidgetThemeService);
    readonly isDark = computed(() => this.themeService.isDark$());
    readonly availableTabs = computed(() => {
        const tabs = [UserManagementTab.Members];
        if (this.pass()) {
            tabs.push(UserManagementTab.Roles, UserManagementTab.Permissions);
        }
        return tabs;
    });
    readonly hasMultipleTabs = computed(() => this.availableTabs().length > 1);
    public pendingDeleteUser: any = null;
    private pendingDeleteIndex: number = -1;
    private pendingEditUser: UserData | null = null;
    public roles: any[] = [];
    public permissions: any[] = [];
    public searchTerm: string = '';
    private searchSubject = new Subject<string>();

    public roleSearchTerm: string = '';
    public filteredRolesData: any[] = [];
    public defaultRoles: any;

    public permissionSearchTerm: string = '';
    public filteredPermissionsData: any[] = [];
    public emailVisibility: { [key: number]: boolean } = {};
    public expandedRoles: { [key: number]: boolean } = {};
    public addUserForm: FormGroup;
    public addRoleForm: FormGroup;
    public addPermissionTabForm: FormGroup;
    public isEditRole: boolean = false;
    public isEditPermission: boolean = false;
    public isEditUser: boolean = false;
    public currentEditingUser: UserData | null = null;
    public currentEditingPermission: UserData | null = null;
    public userData: any[] = [];
    public canRemoveUser: boolean = false;
    public canEditUser: boolean = false;
    public canAddUser: boolean = false;
    public totalUsers: number = 0;
    public currentPageIndex: number = 0;
    public currentPageSize: number = 50;
    public isUsersLoading: boolean = true;
    public isRolesLoading: boolean = false;
    public isPermissionsLoading: boolean = false;
    public skipSkeletonLoading: boolean = false;
    public activeTab: UserManagementTab = UserManagementTab.Members;
    private readonly destroyRef = inject(DestroyRef);
    private readonly fb = inject(FormBuilder);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly store = inject<Store<IAppState>>(Store);
    readonly toastService = inject(ToastService);
    private readonly widgetPortal = inject(WidgetPortalService);
    private readonly bridge = inject(UserManagementBridgeService);
    private readonly actions$ = inject(Actions);

    @ViewChild('mainDialogPortal') private mainDialogPortalEl?: ElementRef<HTMLElement>;
    @ViewChild('confirmDialogPortal') private confirmDialogPortalEl?: ElementRef<HTMLElement>;
    @ViewChild('toastPortal') private toastPortalEl?: ElementRef<HTMLElement>;

    private mainDialogRef: WidgetPortalRef | null = null;
    private confirmDialogRef: WidgetPortalRef | null = null;
    private toastPortalRef: WidgetPortalRef | null = null;

    constructor() {
        effect(() => this.themeService.setInputTheme(this.theme()));
        this.store
            .pipe(select(rolesData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.roles = res.data?.data;
                    this.defaultRoles = res.data?.default_roles;
                    this.filteredRolesData = [...this.roles];
                    this.isRolesLoading = false;
                    if (this.pendingEditUser) {
                        this.patchEditUserForm(this.pendingEditUser);
                        this.pendingEditUser = null;
                    }
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(permissionData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.permissions = res.data.data;
                    this.filteredPermissionsData = [...this.permissions];
                    this.isPermissionsLoading = false;
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(companyUsersData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.totalUsers = res.data?.totalEntityCount || 0;
                    this.canRemoveUser = res.data?.permissionToRemoveUser;
                    this.canAddUser = res.data?.permissionToAddUser;
                    this.canEditUser = res.data?.permissionToEditUser;
                    this.userData = res.data?.users || [];
                    const pageNo = res.data?.pageNo;
                    const itemsPerPage = res.data?.itemsPerPage;
                    if (pageNo !== undefined) {
                        this.currentPageIndex = pageNo - 1;
                    }
                    if (itemsPerPage !== undefined) {
                        this.currentPageSize = parseInt(itemsPerPage, 10) || 10;
                    }
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(companyUsersDataInProcess), takeUntilDestroyed(this.destroyRef))
            .subscribe((isLoaded) => {
                this.isUsersLoading = !isLoaded;
                this.cdr.markForCheck();
            });

        this.store
            .pipe(select(addUserData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getCompanyUsers();
                    if (res?.data?.message) this.toastService.success(res.data.message);
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(roleCreateData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getRoles();
                    this.refreshFormData();
                    if (res?.data?.message) this.toastService.success(res.data.message);
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(permissionCreateData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getPermissions();
                    this.refreshFormData();
                    if (res?.data?.message) this.toastService.success(res.data.message);
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(updatePermissionData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getPermissions();
                    this.refreshFormData();
                    if (res?.data?.message) this.toastService.success(res.data.message);
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(updateRoleData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getRoles();
                    this.refreshFormData();
                    if (res?.data?.message) this.toastService.success(res.data.message);
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(updateCompanyUserData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getCompanyUsers();
                    this.skipSkeletonLoading = false;
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(updateUserRoleData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getCompanyUsers();
                    if (res?.data?.message) this.toastService.success(res.data.message);
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(updateUserPermissionData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getCompanyUsers();
                    if (res?.data?.message) this.toastService.success(res.data.message);
                    this.cdr.markForCheck();
                }
            });

        this.actions$
            .pipe(
                ofType(
                    otpActions.createRoleError,
                    otpActions.updateRoleError,
                    otpActions.createPermissionError,
                    otpActions.updatePermissionError,
                    otpActions.addUserError,
                    otpActions.updateCompanyUserError,
                    otpActions.updateUserRoleError,
                    otpActions.updateUserPermissionError
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(({ errorResponse }) => {
                const msg =
                    errorResponse?.error?.errors?.message ||
                    errorResponse?.error?.data?.message ||
                    errorResponse?.errors?.message ||
                    errorResponse?.data?.message ||
                    errorResponse?.message ||
                    'Something went wrong. Please try again.';
                this.toastService.error(msg);
                this.cdr.markForCheck();
            });

        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe((searchTerm) => {
                this.getCompanyUsers(searchTerm);
                this.cdr.markForCheck();
            });

        this.addUserForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            mobileNumber: ['', [Validators.pattern(/^(\+?[1-9]\d{1,14}|[0-9]{10})$/)]],
            role: [''],
            permission: [[]],
        });

        // Subscribe to role changes to update permissions
        this.addUserForm
            .get('role')
            ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((roleId) => {
                this.onRoleChange(roleId);
            });

        this.addRoleForm = this.fb.group({
            roleName: ['', Validators.required],
            description: [''],
            permission: [[], Validators.required],
        });

        this.addPermissionTabForm = this.fb.group({
            permission: ['', Validators.required],
            description: [''],
        });
        // openAddUserDialog is handled via UserManagementBridgeService.
        // If this component IS mounted, it handles the dialog via addUser()
        // so it can integrate with its own state (refresh table, etc.).
        // If NOT mounted, WidgetDialogService opens a standalone isolated dialog.
        this.bridge.openAddUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.addUser();
        });

        this.destroyRef.onDestroy(() => {
            this.mainDialogRef?.detach();
            this.confirmDialogRef?.detach();
            this.toastPortalRef?.detach();
            this.showDialog.set(false);
            this.showConfirmDialog.set(false);
        });
    }

    ngOnInit(): void {
        this.getCompanyUsers();
    }

    ngAfterViewInit(): void {
        // Teleport the toast to body immediately (always visible, not conditional)
        if (this.toastPortalEl?.nativeElement) {
            this.toastPortalRef = this.widgetPortal.attach(this.toastPortalEl.nativeElement);
        }
    }

    ngOnDestroy(): void {
        // handled via destroyRef.onDestroy above
    }

    public tabChange(tab: UserManagementTab): void {
        this.activeTab = tab;
        if (tab === UserManagementTab.Roles) {
            this.isRolesLoading = true;
            this.getRoles();
            this.getPermissions();
        } else if (tab === UserManagementTab.Permissions) {
            this.isPermissionsLoading = true;
            this.getPermissions();
        } else if (tab === UserManagementTab.Members) {
            this.getCompanyUsers();
        }
    }

    public deleteUser(user: any, index: number): void {
        this.pendingDeleteUser = user;
        this.pendingDeleteIndex = index;
        this.showConfirmDialog.set(true);
        this.cdr.detectChanges();
        if (this.confirmDialogPortalEl?.nativeElement) {
            this.confirmDialogRef = this.widgetPortal.attach(this.confirmDialogPortalEl.nativeElement);
        }
    }

    public confirmDelete(): void {
        if (this.pendingDeleteUser) {
            const userId = (this.pendingDeleteUser as any).user_id;
            this.userData = this.userData.filter((u: any) => u.user_id !== userId);
            this.totalUsers = Math.max(0, this.totalUsers - 1);
            this.store.dispatch(otpActions.deleteUser({ companyId: userId, authToken: this.userToken() }));
        }
        this.cancelDelete();
    }

    public cancelDelete(): void {
        this.confirmDialogRef?.detach();
        this.confirmDialogRef = null;
        this.pendingDeleteUser = null;
        this.pendingDeleteIndex = -1;
        this.showConfirmDialog.set(false);
    }

    public editUser(user: UserData, index: number): void {
        this.skipSkeletonLoading = true;
        this.isEditUser = true;
        this.isEditRole = false;
        this.isEditPermission = false;
        this.currentEditingUser = user;
        this.pendingEditUser = user;
        this.getRoles();
        this.openDialog();
    }

    private patchEditUserForm(user: UserData): void {
        const roleId = this.getRoleIdByName(user.role);
        const userPermissionIds = this.getPermissionIdsByName(user.additionalpermissions || []);
        this.addUserForm.patchValue({
            name: user.name,
            email: user.email,
            mobileNumber: (user as any).mobile || '',
            role: roleId ? roleId.toString() : user.role || '',
            permission: userPermissionIds,
        });
        this.cdr.markForCheck();
    }

    public getPermissionsTooltip(user: UserData): string {
        let tooltip = user?.permissions?.length
            ? `Permissions:\n• ${user.permissions.join('\n• ')}`
            : 'No permissions assigned';
        if (user?.additionalpermissions?.length) {
            tooltip += `\n\nAdditional Permissions:\n+ ${user.additionalpermissions.join('\n+ ')}`;
        }
        return tooltip;
    }

    public applyFilter(): void {
        this.searchSubject.next(this.searchTerm);
    }

    public clearSearch(): void {
        this.searchTerm = '';
        this.applyFilter();
    }

    public isEmailVisible(index: number): boolean {
        return this.emailVisibility[index] || false;
    }

    public toggleEmailVisibility(index: number): void {
        this.emailVisibility[index] = !this.emailVisibility[index];
    }

    public getRoleIdByName(roleName: string): number | undefined {
        return this.roles?.find((r) => r.name === roleName)?.id;
    }

    public getRoleNameById(roleId: number): string {
        return (roleId && this.roles?.find((r) => r.id === roleId)?.name) || '';
    }

    public onRoleChange(roleId: number): void {
        const perms = roleId
            ? (this.roles.find((r) => r.id === roleId)?.c_permissions?.map((p: any) => p.id) ?? [])
            : [];
        this.addUserForm.get('permission')?.setValue(perms);
    }

    public getPermissionIdsByName(permissionNames: string[]): number[] {
        return permissionNames
            .map((permissionName) => {
                const permission = this.permissions.find((p) => p.name === permissionName);
                return permission?.id;
            })
            .filter((id) => id !== undefined) as number[];
    }

    public getPermissionNamesByIds(permissionIds: number[]): string[] {
        return permissionIds
            .map((permissionId) => {
                const permission = this.permissions.find((p) => p.id === permissionId);
                return permission?.name;
            })
            .filter((name) => name !== undefined) as string[];
    }

    private openDialog(): void {
        this.showDialog.set(true);
        this.cdr.detectChanges();
        if (this.mainDialogPortalEl?.nativeElement) {
            this.mainDialogRef = this.widgetPortal.attach(this.mainDialogPortalEl.nativeElement);
        }
    }

    public addUser(): void {
        // Call Add role api to get role to show in dropdown list
        this.getRoles();
        this.isEditUser = false;
        this.isEditRole = false;
        this.isEditPermission = false;
        this.currentEditingUser = null;
        this.addUserForm.reset();

        if (this.defaultRoles?.default_member_role) {
            this.addUserForm.patchValue({ role: this.defaultRoles.default_member_role });
        }

        this.openDialog();
    }

    public closeDialog(): void {
        this.mainDialogRef?.detach();
        this.mainDialogRef = null;
        this.showDialog.set(false);
        this.isEditUser = false;
        this.isEditRole = false;
        this.isEditPermission = false;
        this.currentEditingUser = null;
        this.currentEditingPermission = null;
    }

    public saveUser(): void {
        if (this.addUserForm.valid) {
            const formValue = this.addUserForm.value;
            const selectedRole = formValue.role ? this.getRoleById(formValue.role) : null;
            const roleName = selectedRole?.name || formValue.role || 'User';

            if ((this.isEditUser || this.isEditRole) && this.currentEditingUser) {
                // Update existing user
                const userIndex = this.userData.findIndex((u) => u.userId === this.currentEditingUser!.userId);
                if (userIndex !== -1) {
                    const originalMobile = (this.currentEditingUser as any).mobile || '';
                    const newMobile = formValue.mobileNumber || '';

                    // Build user object with only changed fields
                    const userPayload: any = {
                        id: (this.currentEditingUser as any).user_id,
                        name: formValue.name,
                    };

                    // Only include mobile if it has changed
                    if (originalMobile !== newMobile) {
                        userPayload.mobile = newMobile;
                    }

                    const rolePayload = {
                        id: userPayload.id,
                        role_id: formValue.role,
                    };
                    const permissionPayload = {
                        id: userPayload.id,
                        cpermissions: formValue.permission,
                    };
                    this.store.dispatch(
                        otpActions.updateUserRole({ payload: rolePayload, authToken: this.userToken() })
                    );
                    this.store.dispatch(
                        otpActions.updateUserPermission({ payload: permissionPayload, authToken: this.userToken() })
                    );
                }
            } else {
                // Add new user
                const newUser: UserData = {
                    userId: (this.userData.length + 1).toString().padStart(3, '0'),
                    name: formValue.name,
                    email: formValue.email,
                    mobileNumber: formValue.mobileNumber || '',
                    role: roleName,
                    permissions: this.getDefaultPermissions(roleName),
                };
                const payload = {
                    user: {
                        name: newUser.name,
                        email: newUser.email,
                        mobile: newUser.mobileNumber,
                    },
                    role_id: formValue.role,
                };

                this.store.dispatch(otpActions.addUser({ payload, authToken: this.userToken() }));
            }

            this.closeDialog();
        }
    }

    public getRoleById(roleId: number): Role | undefined {
        return this.roles.find((role) => role.id === roleId);
    }

    public getVisiblePermissions(role: any): any[] {
        if (!role || !role.c_permissions || role.c_permissions.length === 0) {
            return [];
        }
        const isExpanded = this.expandedRoles[role.id] || false;
        return isExpanded ? role.c_permissions : role.c_permissions.slice(0, 3);
    }

    public getDefaultPermissions(role: string): string[] {
        switch (role) {
            case 'Admin':
                return ['Full Access', 'User Management', 'System Settings', 'Reports'];
            case 'Manager':
                return ['User Management', 'Reports', 'View Settings'];
            case 'User':
                return ['Read Only', 'View Reports'];
            default:
                return ['Read Only'];
        }
    }

    public addRole(): void {
        this.isEditRole = true;
        this.isEditPermission = false;
        this.currentEditingUser = null;
        this.addRoleForm.reset();
        this.openDialog();
    }

    public saveAddRole(): void {
        if (!this.addRoleForm.valid) return;
        const formValue = this.addRoleForm.value;
        if (this.isEditRole && this.currentEditingUser) {
            this.store.dispatch(
                otpActions.updateRole({
                    payload: {
                        id: (this.currentEditingUser as any).id,
                        name: formValue.roleName,
                        cpermissions: formValue.permission,
                    },
                    authToken: this.userToken(),
                })
            );
        } else {
            this.store.dispatch(
                otpActions.createRole({
                    name: formValue.roleName,
                    permissions: this.getPermissionNamesByIds(formValue.permission),
                    authToken: this.userToken(),
                })
            );
        }
        this.addRoleForm.reset();
        this.closeDialog();
    }

    public saveAddPermissionTab(): void {
        if (!this.addPermissionTabForm.valid) return;
        const formValue = this.addPermissionTabForm.value;
        if (this.isEditPermission && this.currentEditingPermission) {
            this.store.dispatch(
                otpActions.updatePermission({
                    payload: { id: (this.currentEditingPermission as any).id, name: formValue.permission },
                    authToken: this.userToken(),
                })
            );
        } else {
            this.store.dispatch(
                otpActions.createPermission({ name: formValue.permission, authToken: this.userToken() })
            );
        }
        this.addPermissionTabForm.reset();
        this.closeDialog();
    }
    public allRolePermissionsSelected(): boolean {
        const selected: number[] = this.addRoleForm.get('permission')?.value ?? [];
        return this.permissions.length > 0 && selected.length === this.permissions.length;
    }

    public someRolePermissionsSelected(): boolean {
        const selected: number[] = this.addRoleForm.get('permission')?.value ?? [];
        return selected.length > 0 && selected.length < this.permissions.length;
    }

    public toggleAllRolePermissions(event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;
        const ids = checked ? this.permissions.map((p) => p.id) : [];
        this.addRoleForm.get('permission')?.setValue(ids);
        this.addRoleForm.get('permission')?.markAsTouched();
    }

    public allUserPermissionsSelected(): boolean {
        const available = this.getAvailableAdditionalPermissions();
        const selected: number[] = this.addUserForm.get('permission')?.value ?? [];
        return available.length > 0 && available.every((p) => selected.includes(p.id));
    }

    public someUserPermissionsSelected(): boolean {
        const available = this.getAvailableAdditionalPermissions();
        const selected: number[] = this.addUserForm.get('permission')?.value ?? [];
        const count = available.filter((p) => selected.includes(p.id)).length;
        return count > 0 && count < available.length;
    }

    public toggleAllUserPermissions(event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;
        const available = this.getAvailableAdditionalPermissions();
        const current: number[] = this.addUserForm.get('permission')?.value ?? [];
        const availableIds = available.map((p) => p.id);
        const ids = checked
            ? [...new Set([...current, ...availableIds])]
            : current.filter((id) => !availableIds.includes(id));
        this.addUserForm.get('permission')?.setValue(ids);
        this.addUserForm.get('permission')?.markAsTouched();
    }

    public onPermissionCheckboxChange(formName: 'addRoleForm' | 'addUserForm', permId: number, event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;
        const form = this[formName];
        const current: number[] = form.get('permission')?.value ?? [];
        const updated = checked ? [...current, permId] : current.filter((id) => id !== permId);
        form.get('permission')?.setValue(updated);
        form.get('permission')?.markAsTouched();
    }

    public getCompanyUsers(search?: string): void {
        const pageSize = this.currentPageSize;
        const pageIndex = this.currentPageIndex;
        const searchTerm = search?.trim() || undefined;
        this.store.dispatch(
            otpActions.getCompanyUsers({
                authToken: this.userToken(),
                itemsPerPage: pageSize,
                pageNo: pageIndex,
                search: searchTerm,
                exclude_role_ids: this.exclude_role_ids(),
                include_role_ids: this.include_role_ids(),
            })
        );
    }

    public onUsersPageChange(event: PageEvent): void {
        this.currentPageIndex = event.pageIndex;
        this.currentPageSize = event.pageSize;
        const searchTerm = this.searchTerm?.trim() || undefined;
        // API expects 1-based page number
        this.store.dispatch(
            otpActions.getCompanyUsers({
                authToken: this.userToken(),
                itemsPerPage: event.pageSize,
                pageNo: event.pageIndex,
                search: searchTerm,
            })
        );
    }
    public getRoles(): void {
        this.store.dispatch(otpActions.getRoles({ authToken: this.userToken(), itemsPerPage: 1000 }));
    }

    public onRolesPageChange(event: PageEvent): void {
        this.store.dispatch(otpActions.getRoles({ authToken: this.userToken(), itemsPerPage: event.pageSize }));
    }
    public getPermissions(): void {
        const pageSize = 1000;
        this.store.dispatch(otpActions.getPermissions({ authToken: this.userToken(), itemsPerPage: pageSize }));
    }

    public refreshFormData(): void {
        setTimeout(() => {
            this.filteredPermissionsData = [...this.permissions];
            this.filteredRolesData = [...this.roles];
            this.cdr.markForCheck();
        }, 100);
    }

    // Role management methods
    public applyRoleFilter(): void {
        const q = this.roleSearchTerm.toLowerCase().trim();
        this.filteredRolesData = q
            ? this.roles.filter(
                  (role) =>
                      role.name.toLowerCase().includes(q) ||
                      role.c_permissions?.some((p: any) => p.name.toLowerCase().includes(q))
              )
            : [...this.roles];
    }

    public editRole(role: any, index: number): void {
        this.currentEditingUser = role;
        this.isEditRole = true;
        this.isEditPermission = false;
        this.isEditUser = false;

        const permissionIds = role.c_permissions ? role.c_permissions.map((p: any) => p.id) : [];
        const patchFn = () => {
            this.addRoleForm.patchValue({
                roleName: role.name,
                description: `Description for ${role.name} role`,
                permission: permissionIds,
            });
        };

        this.openDialog();
        if (this.permissions?.length > 0) {
            patchFn();
        } else {
            setTimeout(patchFn, 500);
        }
    }

    // Permission management methods
    public applyPermissionFilter(): void {
        const q = this.permissionSearchTerm.toLowerCase().trim();
        this.filteredPermissionsData = q
            ? this.permissions.filter((p) => p.name.toLowerCase().includes(q))
            : [...this.permissions];
    }

    public openAddPermissionDialog(): void {
        this.isEditPermission = true;
        this.isEditRole = false;
        this.currentEditingPermission = null;
        this.addPermissionTabForm.reset();
        this.openDialog();
    }

    public editPermission(permission: any, index: number): void {
        this.currentEditingPermission = permission;
        this.isEditPermission = true;
        this.isEditRole = false;

        this.addPermissionTabForm.patchValue({
            permission: permission.name,
            description: `Description for ${permission.name} permission`,
        });

        this.openDialog();
    }

    // Dialog helper methods
    public getDialogTitle(): string {
        if (this.isEditPermission) return this.currentEditingPermission ? 'Edit Permission' : 'Add New Permission';
        if (this.isEditRole) return this.currentEditingUser ? 'Edit Role' : 'Add New Role';
        return this.isEditUser ? 'Edit member' : 'Add New member';
    }

    public getSaveAction(): void {
        if (this.isEditPermission) this.saveAddPermissionTab();
        else if (this.isEditRole) this.saveAddRole();
        else this.saveUser();
    }

    public getFormInvalid(): boolean {
        if (this.isEditPermission) return this.addPermissionTabForm.invalid;
        if (this.isEditRole) return this.addRoleForm.invalid;
        return this.addUserForm.invalid;
    }

    public getSaveButtonText(): string {
        if (this.isEditPermission) return this.currentEditingPermission ? 'Update Permission' : 'Add Permission';
        if (this.isEditRole) return this.currentEditingUser ? 'Update Role' : 'Add Role';
        return this.isEditUser ? 'Update member' : 'Add member';
    }

    public getAvailableAdditionalPermissions(): any[] {
        if (!this.currentEditingUser) {
            return [];
        }
        const userRole = this.roles.find((role) => role.name === this.currentEditingUser!.role);
        const rolePermissionNames: string[] = userRole?.c_permissions?.map((p: any) => p.name) ?? [];
        return this.permissions.filter((p) => !rolePermissionNames.includes(p.name));
    }
}
