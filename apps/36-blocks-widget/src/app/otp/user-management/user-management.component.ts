import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    OnInit,
    computed,
    inject,
    input,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicScriptTheme } from '@proxy/constant';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { UserData, Role, UserManagementTab } from '../model/otp';

@Component({
    selector: 'user-management',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent implements OnInit {
    readonly userToken = input<string>();
    readonly pass = input<boolean>(false);
    readonly theme = input<string>();
    protected readonly PublicScriptTheme = PublicScriptTheme;
    protected readonly UserManagementTab = UserManagementTab;
    readonly exclude_role_ids = input<any[]>([]);
    readonly include_role_ids = input<any[]>([]);
    readonly isHidden = signal(false);
    readonly showDialog = signal(false);
    readonly showConfirmDialog = signal(false);
    private readonly _systemDark = signal(
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    readonly isDark = computed(() => {
        const t = this.theme();
        if (t === PublicScriptTheme.Dark) return true;
        if (t === PublicScriptTheme.Light) return false;
        return this._systemDark();
    });
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

    constructor() {
        this.store
            .pipe(select(rolesData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.roles = res.data?.data;
                    this.defaultRoles = res.data?.default_roles;
                    this.filteredRolesData = [...this.roles];
                    this.isRolesLoading = false;
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
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(roleCreateData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getRoles();
                    this.refreshFormData();
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(permissionCreateData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getPermissions();
                    this.refreshFormData();
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(updatePermissionData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getPermissions();
                    this.refreshFormData();
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(updateRoleData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getRoles();
                    this.refreshFormData();
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
                    this.cdr.markForCheck();
                }
            });

        this.store
            .pipe(select(updateUserPermissionData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.getCompanyUsers();
                    this.cdr.markForCheck();
                }
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
        if (typeof window !== 'undefined') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const mqListener = (e: MediaQueryListEvent) => {
                this._systemDark.set(e.matches);
                this.cdr.markForCheck();
            };
            mq.addEventListener('change', mqListener);
            this.destroyRef.onDestroy(() => mq.removeEventListener('change', mqListener));
        }

        const openAddUser = this.addUser.bind(this);
        const showMgmt = () => this.isHidden.set(false);
        const hideMgmt = () => this.isHidden.set(true);

        window.addEventListener('openAddUserDialog', openAddUser);
        window.addEventListener('showUserManagement', showMgmt);
        window.addEventListener('hideUserManagement', hideMgmt);

        this.destroyRef.onDestroy(() => {
            window.removeEventListener('openAddUserDialog', openAddUser);
            window.removeEventListener('showUserManagement', showMgmt);
            window.removeEventListener('hideUserManagement', hideMgmt);
            this.showDialog.set(false);
            this.showConfirmDialog.set(false);
        });
    }

    ngOnInit(): void {
        this.getCompanyUsers();
    }

    public tabChange(tab: UserManagementTab): void {
        this.activeTab = tab;
        if (tab === UserManagementTab.Roles) {
            this.isRolesLoading = true;
            this.getRoles();
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
        const roleId = this.getRoleIdByName(user.role);
        const userPermissionIds = this.getPermissionIdsByName(user.additionalpermissions || []);

        this.addUserForm.patchValue({
            name: user.name,
            email: user.email,
            mobileNumber: (user as any).mobile || '',
            role: roleId || user.role,
            permission: userPermissionIds,
        });

        this.openDialog();
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

    public maskEmail(email: string): string {
        if (!email?.includes('@')) return email;
        const [local, domain] = email.split('@');
        if (local.length <= 2) return `${local[0]}***@${domain}`;
        if (local.length <= 4) return `${local.substring(0, 2)}***@${domain}`;
        return `${local.substring(0, 2)}${'*'.repeat(Math.max(3, local.length - 3))}${local.slice(-1)}@${domain}`;
    }

    public getEmailDisplay(email: string, index: number): string {
        return this.isEmailVisible(index) ? email : this.maskEmail(email);
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
        const perms = roleId ? this.roles.find((r) => r.id === roleId)?.c_permissions?.map((p: any) => p.id) ?? [] : [];
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
        if (this.theme() === PublicScriptTheme.Dark) {
            document.body.classList.add('dark-dialog-open');
        }
        this.showDialog.set(true);
    }

    public addUser(): void {
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
        this.showDialog.set(false);
        this.isEditUser = false;
        this.isEditRole = false;
        this.isEditPermission = false;
        this.currentEditingUser = null;
        this.currentEditingPermission = null;
        document.body.classList.remove('dark-dialog-open');
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
