import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    ViewChild,
    TemplateRef,
    AfterViewInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../store/app.state';
import { BaseComponent } from '@proxy/ui/base-component';
import { otpActions } from '../store/actions';
import { distinctUntilChanged, Observable, takeUntil } from 'rxjs';
import {
    addUserData,
    companyUsersData,
    deleteUserData,
    permissionCreateData,
    permissionData,
    roleCreateData,
    rolesData,
    updateCompanyUserData,
    updatePermissionData,
    updateRoleData,
} from '../store/selectors';
import { isEqual } from 'lodash';
import { UserData, Role } from '../model/otp';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';

@Component({
    selector: 'proxy-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() public userToken: string;
    @Input() public pass: string;
    @Input() public theme: string;
    @ViewChild('addUserDialog') addUserDialog!: TemplateRef<any>;
    @ViewChild('editPermissionDialog') editPermissionDialog!: TemplateRef<any>;
    @ViewChild('addPermissionDialog') addPermissionDialog!: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('rolesPaginator') rolesPaginator!: MatPaginator;
    @ViewChild('permissionsPaginator') permissionsPaginator!: MatPaginator;
    private addUserDialogRef: any;
    private editPermissionDialogRef: any;
    private addPermissionDialogRef: any;
    public getRoles$: Observable<any>;
    public getPermissions$: Observable<any>;
    public getCompanyUsers$: Observable<any>;
    public getRoleCreate$: Observable<any>;
    public getPermissionCreate$: Observable<any>;
    public addUserData$: Observable<any>;
    public updateCompanyUserData$: Observable<any>;
    public updatePermissionData$: Observable<any>;
    public updateRoleData$: Observable<any>;
    public deleteUserData$: Observable<any>;
    public roles: any[] = [];
    public permissions: any[] = [];
    public displayedColumns: string[] = ['name', 'email', 'role'];
    public dataSource = new MatTableDataSource<UserData>([]);
    public searchTerm: string = '';
    public filteredData: UserData[] = [];

    // Roles table properties
    public rolesDisplayedColumns: string[] = ['role', 'permissions'];
    public rolesDataSource = new MatTableDataSource<any>([]);
    public roleSearchTerm: string = '';
    public filteredRolesData: any[] = [];

    // Permissions table properties
    public permissionsDisplayedColumns: string[] = ['permission'];
    public permissionsDataSource = new MatTableDataSource<any>([]);
    public permissionSearchTerm: string = '';
    public filteredPermissionsData: any[] = [];
    public emailVisibility: { [key: number]: boolean } = {};
    public expandedRoles: { [key: number]: boolean } = {};
    public addUserForm: FormGroup;
    public editPermissionForm: FormGroup;
    public addPermissionForm: FormGroup;
    public addRoleForm: FormGroup;
    public addPermissionTabForm: FormGroup;
    public isEditRole: boolean = false;
    public isEditPermission: boolean = false;
    public isEditUser: boolean = false;
    public currentEditingUser: UserData | null = null;
    public currentEditingPermission: UserData | null = null;
    public userData: any[] = [];
    public userId: any;
    public canRemoveUser: boolean = false;
    constructor(private fb: FormBuilder, private dialog: MatDialog, private store: Store<IAppState>) {
        super();
        this.getRoles$ = this.store.pipe(select(rolesData), distinctUntilChanged(isEqual), takeUntil(this.destroy$));
        this.getPermissions$ = this.store.pipe(
            select(permissionData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.getCompanyUsers$ = this.store.pipe(
            select(companyUsersData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.getRoleCreate$ = this.store.pipe(
            select(roleCreateData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.getPermissionCreate$ = this.store.pipe(
            select(permissionCreateData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );

        this.addUserData$ = this.store.pipe(
            select(addUserData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.updateCompanyUserData$ = this.store.pipe(
            select(updateCompanyUserData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.updatePermissionData$ = this.store.pipe(
            select(updatePermissionData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.updateRoleData$ = this.store.pipe(
            select(updateRoleData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
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
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((roleId) => {
                this.onRoleChange(roleId);
            });

        this.editPermissionForm = this.fb.group({
            roleName: ['', Validators.required],
            description: [''],
            permission: [[], Validators.required],
            selectedPermission: [''],
            permissionName: [''],
        });
        this.addPermissionForm = this.fb.group({
            permission: ['', Validators.required],
            description: [''],
        });

        // New form groups for tabs
        this.addRoleForm = this.fb.group({
            roleName: ['', Validators.required],
            description: [''],
            permission: [[], Validators.required],
        });

        this.addPermissionTabForm = this.fb.group({
            permission: ['', Validators.required],
            description: [''],
        });
        this.deleteUserData$ = this.store.pipe(
            select(deleteUserData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.getRoles$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.roles = res.data?.data;
                this.filteredRolesData = [...this.roles];
                this.rolesDataSource.data = this.filteredRolesData;
            }
        });
        this.getPermissions$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.permissions = res.data.data;
                this.filteredPermissionsData = [...this.permissions];
                this.permissionsDataSource.data = this.filteredPermissionsData;
            }
        });
        this.getCompanyUsers$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.canRemoveUser = res.data?.permissionToRemoveUser;
                this.userData = res.data?.users;
                this.dataSource.data = this.userData;
            }
        });
        this.addUserData$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.getCompanyUsers();
            }
        });
        this.getRoleCreate$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.getRoles();
                // Force form refresh after role creation
                this.refreshFormData();
            }
        });
        this.getPermissionCreate$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.getPermissions();
                // Force form refresh after permission creation
                this.refreshFormData();
            }
        });
        this.updatePermissionData$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.getPermissions();
                // Force form refresh after permission update
                this.refreshFormData();
            }
        });
        this.updateRoleData$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.getRoles();
                // Force form refresh after role update
                this.refreshFormData();
            }
        });
        this.updateCompanyUserData$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.getCompanyUsers();
            }
        });
        this.deleteUserData$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.getCompanyUsers();
            }
        });
        this.getCompanyUsers();
        this.getRoles();
        this.getPermissions();

        // Ensure form is initialized
        if (!this.addUserForm) {
            this.addUserForm = this.fb.group({
                name: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
                mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
                role: ['', Validators.required],
            });
        }

        if (!this.editPermissionForm) {
            this.editPermissionForm = this.fb.group({
                roleName: ['', Validators.required],
                description: ['', Validators.required],
                permission: [[], Validators.required],
                selectedPermission: ['', Validators.required],
                permissionName: ['', Validators.required],
            });
        }

        // Initialize dataSource with userData
        this.filteredData = [...this.userData];
        this.dataSource.data = this.filteredData;
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.rolesDataSource.paginator = this.rolesPaginator;
        this.permissionsDataSource.paginator = this.permissionsPaginator;

        // Set up observer to detect paginator select opens
        this.setupPaginatorSelectObserver();
    }

    ngOnDestroy(): void {
        // Clean up the paginator select observer
        if ((this as any)._paginatorSelectObserver) {
            (this as any)._paginatorSelectObserver.disconnect();
            (this as any)._paginatorSelectObserver = null;
        }
        super.ngOnDestroy();
    }

    public editUser(user: UserData, index: number): void {
        this.isEditUser = true;
        this.isEditRole = false;
        this.isEditPermission = false;
        this.currentEditingUser = user;
        const roleId = this.getRoleIdByName(user.role);

        // Get permission IDs for the user's additional permissions
        const userPermissionIds = this.getPermissionIdsByName(user.additionalpermissions || []);

        // Set all form values at once to avoid triggering role change during initial setup
        this.addUserForm.patchValue({
            name: user.name,
            email: user.email,
            mobileNumber: (user as any).mobile || '',
            role: roleId || user.role,
            permission: userPermissionIds,
        });

        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            panelClass: this.theme === 'dark' ? ['dark-dialog'] : [],
            disableClose: true,
        });

        // Add body class for dark theme select panel styling
        if (this.theme === 'dark') {
            document.body.classList.add('dark-dialog-open');
            this.addUserDialogRef.afterClosed().subscribe(() => {
                document.body.classList.remove('dark-dialog-open');
            });
        }

        // Add body class for dark theme select panel styling
        if (this.theme === 'dark') {
            document.body.classList.add('dark-dialog-open');
            this.addUserDialogRef.afterClosed().subscribe(() => {
                document.body.classList.remove('dark-dialog-open');
            });
        }
    }

    public deleteUser(user: any, index: number): void {
        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            panelClass: this.theme === 'dark' ? ['dark-dialog'] : [],
        });

        const componentInstance = dialogRef.componentInstance;
        componentInstance.title = 'Delete User';
        componentInstance.confirmationMessage = `Are you sure you want to delete ${user.name}?`;
        componentInstance.confirmButtonText = 'Delete';
        componentInstance.cancelButtonText = 'Cancel';
        componentInstance.confirmButtonColor = '';
        componentInstance.confirmButtonClass = 'mat-flat-button btn-danger confirm-dialog';

        dialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                this.store.dispatch(otpActions.deleteUser({ companyId: user.user_id, authToken: this.userToken }));
            }
        });
    }

    public getPermissionsTooltip(user: UserData): string {
        let tooltipText = '';

        if (user && user.permissions && user.permissions.length > 0) {
            const permissionsText = user.permissions.join('\n• ');
            tooltipText = `Permissions:\n• ${permissionsText}`;
        } else {
            tooltipText = 'No permissions assigned';
        }

        if (user && user.additionalpermissions && user.additionalpermissions.length > 0) {
            const additionalPermissionsText = user.additionalpermissions.join('\n+ ');
            tooltipText += `\n\nAdditional Permissions:\n+ ${additionalPermissionsText}`;
        }

        return tooltipText;
    }

    public applyFilter(): void {
        if (!this.searchTerm || this.searchTerm.trim() === '') {
            this.filteredData = [...this.userData];
        } else {
            const searchLower = this.searchTerm.toLowerCase().trim();
            this.filteredData = this.userData.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    user.role.toLowerCase().includes(searchLower) ||
                    (user.permissions &&
                        user.permissions.some((permission) => permission.toLowerCase().includes(searchLower)))
            );
        }
        this.dataSource.data = this.filteredData;
    }

    public clearSearch(): void {
        this.searchTerm = '';
        this.applyFilter();
    }

    public maskEmail(email: string): string {
        if (!email || !email.includes('@')) {
            return email;
        }

        const [localPart, domain] = email.split('@');

        if (localPart.length <= 2) {
            // For very short usernames, show first character and mask the rest
            return `${localPart[0]}***@${domain}`;
        } else if (localPart.length <= 4) {
            // For short usernames, show first 2 characters
            return `${localPart.substring(0, 2)}***@${domain}`;
        } else {
            // For longer usernames, show first 2 and last 1 character
            const firstPart = localPart.substring(0, 2);
            const lastPart = localPart.substring(localPart.length - 1);
            const maskedPart = '*'.repeat(Math.max(3, localPart.length - 3));
            return `${firstPart}${maskedPart}${lastPart}@${domain}`;
        }
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
        if (!this.roles || !Array.isArray(this.roles)) {
            return undefined;
        }

        const role = this.roles.find((role) => role.name === roleName);
        return role?.id;
    }

    public onRoleChange(roleId: number): void {
        if (!roleId) {
            // If no role selected, clear permissions
            this.addUserForm.get('permission')?.setValue([]);
            return;
        }

        // Find the selected role
        const selectedRole = this.roles.find((role) => role.id === roleId);
        if (selectedRole && selectedRole.c_permissions) {
            // Get permission IDs for the role's permissions
            const rolePermissionIds = selectedRole.c_permissions.map((p: any) => p.id);
            this.addUserForm.get('permission')?.setValue(rolePermissionIds);
        } else {
            // If role has no permissions, clear the permission field
            this.addUserForm.get('permission')?.setValue([]);
        }
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

    public addUser(): void {
        this.isEditUser = false;
        this.isEditRole = false;
        this.isEditPermission = false;
        this.currentEditingUser = null;
        this.addUserForm.reset();
        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            panelClass: this.theme === 'dark' ? ['dark-dialog'] : [],
            disableClose: true,
        });

        // Add body class for dark theme select panel styling
        if (this.theme === 'dark') {
            document.body.classList.add('dark-dialog-open');
            this.addUserDialogRef.afterClosed().subscribe(() => {
                document.body.classList.remove('dark-dialog-open');
            });
        }

        // Add body class for dark theme select panel styling
        if (this.theme === 'dark') {
            document.body.classList.add('dark-dialog-open');
            this.addUserDialogRef.afterClosed().subscribe(() => {
                document.body.classList.remove('dark-dialog-open');
            });
        }

        // Add body class for dark theme select panel styling
        if (this.theme === 'dark') {
            document.body.classList.add('dark-dialog-open');
            this.addUserDialogRef.afterClosed().subscribe(() => {
                document.body.classList.remove('dark-dialog-open');
            });
        }
    }

    public closeDialog(): void {
        if (this.addUserDialogRef) {
            this.addUserDialogRef.close();
        }
        // Remove body class when dialog closes
        document.body.classList.remove('dark-dialog-open');
        // Reset all edit flags
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

                    const payload = {
                        user: userPayload,
                        cpermissions: formValue.permission,
                        role_id: formValue.role,
                    };
                    this.store.dispatch(otpActions.updateCompanyUser({ payload, authToken: this.userToken }));
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

                this.store.dispatch(otpActions.addUser({ payload, authToken: this.userToken }));
            }

            // Update dataSource to reflect changes
            this.dataSource.data = [...this.userData];
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

    public editUserPermission(user: UserData): void {
        this.currentEditingPermission = user;
        this.editPermissionForm.patchValue({
            roleName: user.role,
            description: `Description for ${user.role} role`,
            permission: user.permissions,
            selectedPermission: '',
            permissionName: '',
        });
        this.editPermissionDialogRef = this.dialog.open(this.editPermissionDialog, {
            width: '500px',
            disableClose: true,
        });
    }

    public onPermissionSelected(selectedPermission: string): void {
        this.editPermissionForm.patchValue({
            permissionName: selectedPermission,
        });
    }

    public closePermissionDialog(): void {
        if (this.editPermissionDialogRef) {
            this.editPermissionDialogRef.close();
        }
    }

    public savePermission(): void {
        if (this.editPermissionForm.valid) {
            const formValue = this.editPermissionForm.value;

            if (this.currentEditingPermission) {
                // Update existing user's permission name
                const userIndex = this.userData.findIndex((u) => u.userId === this.currentEditingPermission!.userId);

                if (userIndex !== -1) {
                    // Find and replace the selected permission with the new name
                    const updatedPermissions = this.userData[userIndex].permissions.map((perm) =>
                        perm === formValue.selectedPermission ? formValue.permissionName : perm
                    );

                    this.userData[userIndex] = {
                        ...this.userData[userIndex],
                        permissions: updatedPermissions,
                    };
                }
            } else {
                // Add new role (create a new user with the role)
                const newUser: UserData = {
                    userId: (this.userData.length + 1).toString().padStart(3, '0'),
                    name: ` ${formValue.roleName}`,
                    email: `user${this.userData.length + 1}@example.com`,
                    mobileNumber: '0000000000',
                    role: formValue.roleName,
                    permissions: formValue.permission,
                };

                this.userData.push(newUser);
                this.store.dispatch(
                    otpActions.createRole({
                        name: formValue.roleName,
                        permissions: formValue.permission,
                        authToken: this.userToken,
                    })
                );
            }

            this.closePermissionDialog();
        }
    }

    public addRole(): void {
        this.isEditRole = true;
        this.isEditPermission = false;
        this.currentEditingUser = null;
        this.addRoleForm.reset();
        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            panelClass: this.theme === 'dark' ? ['dark-dialog'] : [],
            disableClose: true,
        });
    }

    public addPermission(): void {
        this.addPermissionDialogRef = this.dialog.open(this.addPermissionDialog, {
            width: '500px',
            disableClose: true,
        });
    }

    public closeAddPermissionDialog(): void {
        this.addPermissionDialogRef.close();
    }

    public saveAddPermission(): void {}

    // New methods for tab forms
    public saveAddRole(): void {
        if (this.addRoleForm.valid) {
            const formValue = this.addRoleForm.value;

            // Convert permission IDs to permission names
            const permissionNames = this.getPermissionNamesByIds(formValue.permission);

            if (this.isEditRole && this.currentEditingUser) {
                // Update existing role
                this.store.dispatch(
                    otpActions.updateRole({
                        payload: {
                            id: (this.currentEditingUser as any).id,
                            name: formValue.roleName,
                            cpermissions: formValue.permission,
                        },
                        authToken: this.userToken,
                    })
                );
                // TODO: Implement role update logic
            } else {
                // Add new role
                this.store.dispatch(
                    otpActions.createRole({
                        name: formValue.roleName,
                        permissions: permissionNames,
                        authToken: this.userToken,
                    })
                );
            }

            this.addRoleForm.reset();
            this.closeDialog();
        }
    }

    public saveAddPermissionTab(): void {
        if (this.addPermissionTabForm.valid) {
            const formValue = this.addPermissionTabForm.value;

            if (this.isEditPermission && this.currentEditingPermission) {
                // Update existing permission
                this.store.dispatch(
                    otpActions.updatePermission({
                        payload: {
                            id: (this.currentEditingPermission as any).id,
                            name: formValue.permission,
                        },
                        authToken: this.userToken,
                    })
                );
            } else {
                // Add new permission
                this.store.dispatch(
                    otpActions.createPermission({
                        name: formValue.permission,

                        authToken: this.userToken,
                    })
                );
            }

            this.addPermissionTabForm.reset();
            this.closeDialog();
        }
    }
    public getCompanyUsers(): void {
        const pageSize = this.paginator?.pageSize || 1000;
        this.store.dispatch(otpActions.getCompanyUsers({ authToken: this.userToken, itemsPerPage: pageSize }));
    }

    public onUsersPageChange(event: PageEvent): void {
        this.store.dispatch(otpActions.getCompanyUsers({ authToken: this.userToken, itemsPerPage: event.pageSize }));
    }
    public getRoles(): void {
        const pageSize = this.rolesPaginator?.pageSize || 1000;
        this.store.dispatch(otpActions.getRoles({ authToken: this.userToken, itemsPerPage: pageSize }));
    }

    public onRolesPageChange(event: PageEvent): void {
        this.store.dispatch(otpActions.getRoles({ authToken: this.userToken, itemsPerPage: event.pageSize }));
    }
    public getPermissions(): void {
        this.store.dispatch(otpActions.getPermissions({ authToken: this.userToken }));
    }

    public refreshFormData(): void {
        // Force change detection to update multiselect options
        setTimeout(() => {
            // Trigger change detection by updating the arrays
            this.permissions = [...this.permissions];
            this.roles = [...this.roles];

            // Update filtered data as well
            this.filteredPermissionsData = [...this.permissions];
            this.filteredRolesData = [...this.roles];

            // Update data sources
            this.permissionsDataSource.data = this.filteredPermissionsData;
            this.rolesDataSource.data = this.filteredRolesData;
        }, 100);
    }

    // Role management methods
    public applyRoleFilter(): void {
        if (!this.roleSearchTerm || this.roleSearchTerm.trim() === '') {
            this.filteredRolesData = [...this.roles];
        } else {
            const searchLower = this.roleSearchTerm.toLowerCase().trim();
            this.filteredRolesData = this.roles.filter(
                (role) =>
                    role.name.toLowerCase().includes(searchLower) ||
                    (role.c_permissions &&
                        role.c_permissions.some((permission: any) =>
                            permission.name.toLowerCase().includes(searchLower)
                        ))
            );
        }
        this.rolesDataSource.data = this.filteredRolesData;
    }

    public openAddRoleDialog(): void {
        // Open the existing add role dialog
        this.addRole();
    }

    public editRole(role: any, index: number): void {
        // Set the current editing role
        this.currentEditingUser = role;
        this.isEditRole = true;
        this.isEditPermission = false;
        this.isEditUser = false;

        // Get permission IDs from the role's permissions
        const permissionIds = role.c_permissions ? role.c_permissions.map((p: any) => p.id) : [];
        // Open the add user dialog (which contains the role form)
        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            panelClass: this.theme === 'dark' ? ['dark-dialog'] : [],
            disableClose: true,
        });

        // Populate the addRoleForm with the role data after dialog is opened
        setTimeout(() => {
            // Ensure permissions are loaded before setting the form values
            if (this.permissions && this.permissions.length > 0) {
                this.addRoleForm.patchValue({
                    roleName: role.name,
                    description: `Description for ${role.name} role`,
                    permission: permissionIds,
                });

                // Verify the form was updated correctly
            } else {
                // Retry after a longer delay if permissions are not loaded
                setTimeout(() => {
                    this.addRoleForm.patchValue({
                        roleName: role.name,
                        description: `Description for ${role.name} role`,
                        permission: permissionIds,
                    });
                }, 500);
            }
        }, 100);
    }

    // Permission management methods
    public applyPermissionFilter(): void {
        if (!this.permissionSearchTerm || this.permissionSearchTerm.trim() === '') {
            this.filteredPermissionsData = [...this.permissions];
        } else {
            const searchLower = this.permissionSearchTerm.toLowerCase().trim();
            this.filteredPermissionsData = this.permissions.filter((permission) =>
                permission.name.toLowerCase().includes(searchLower)
            );
        }
        this.permissionsDataSource.data = this.filteredPermissionsData;
    }

    public openAddPermissionDialog(): void {
        this.isEditPermission = true;
        this.isEditRole = false;
        this.currentEditingPermission = null;
        this.addPermissionTabForm.reset();
        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            panelClass: this.theme === 'dark' ? ['dark-dialog'] : [],
            disableClose: true,
        });
    }

    public editPermission(permission: any, index: number): void {
        this.currentEditingPermission = permission;
        this.isEditPermission = true;
        this.isEditRole = false;

        this.addPermissionTabForm.patchValue({
            permission: permission.name,
            description: `Description for ${permission.name} permission`,
        });

        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            panelClass: this.theme === 'dark' ? ['dark-dialog'] : [],
            disableClose: true,
        });
    }

    // Dialog helper methods
    public getDialogTitle(): string {
        if (this.isEditPermission) {
            return this.currentEditingPermission ? 'Edit Permission' : 'Add New Permission';
        } else if (this.isEditRole) {
            return this.currentEditingUser ? 'Edit Role' : 'Add New Role';
        } else if (this.isEditUser) {
            return 'Edit User';
        } else {
            return 'Add New User';
        }
    }

    public getSaveAction(): void {
        if (this.isEditPermission) {
            this.saveAddPermissionTab();
        } else if (this.isEditRole) {
            this.saveAddRole();
        } else if (this.isEditUser) {
            this.saveUser();
        } else {
            this.saveUser();
        }
    }

    public getFormInvalid(): boolean {
        if (this.isEditPermission) {
            return this.addPermissionTabForm.invalid;
        } else if (this.isEditRole) {
            return this.addRoleForm.invalid;
        } else if (this.isEditUser) {
            return this.addUserForm.invalid;
        } else {
            return this.addUserForm.invalid;
        }
    }

    public getSaveButtonText(): string {
        if (this.isEditPermission) {
            return this.currentEditingPermission ? 'Update Permission' : 'Add Permission';
        } else if (this.isEditRole) {
            return this.currentEditingUser ? 'Update Role' : 'Add Role';
        } else if (this.isEditUser) {
            return 'Update User';
        } else {
            return 'Add User';
        }
    }

    public getAvailableAdditionalPermissions(): any[] {
        if (!this.currentEditingUser) {
            return [];
        }

        // Get role permissions
        const rolePermissions = this.getRolePermissions();
        const rolePermissionNames = rolePermissions.map((p) => p.name);

        // Get permissions that are NOT part of the role
        const availablePermissions = this.permissions.filter(
            (permission) => !rolePermissionNames.includes(permission.name)
        );

        return availablePermissions;
    }

    private getRolePermissions(): any[] {
        if (!this.currentEditingUser) {
            return [];
        }

        // Find the role by name
        const userRole = this.roles.find((role) => role.name === this.currentEditingUser.role);
        if (!userRole || !userRole.c_permissions) {
            return [];
        }

        return userRole.c_permissions;
    }

    public onPermissionSelectOpenedChange(isOpen: boolean): void {
        if (isOpen) {
            // Use setTimeout to ensure the CDK overlay is created
            setTimeout(() => {
                // Find all CDK overlay panes
                const overlayPanes = document.querySelectorAll('.cdk-overlay-pane');
                overlayPanes.forEach((pane: Element) => {
                    // Check if this pane contains the permission-select-panel
                    const hasPermissionPanel = pane.querySelector('.mat-select-panel.permission-select-panel');
                    if (hasPermissionPanel && !pane.classList.contains('permission-select-panel')) {
                        pane.classList.add('permission-select-panel');
                    }
                });
            }, 0);
        } else {
            // Optionally remove the class when closed
            const overlayPanes = document.querySelectorAll('.cdk-overlay-pane.permission-select-panel');
            overlayPanes.forEach((pane: Element) => {
                const hasPermissionPanel = pane.querySelector('.mat-select-panel.permission-select-panel');
                if (!hasPermissionPanel) {
                    pane.classList.remove('permission-select-panel');
                }
            });
        }
    }

    private setupPaginatorSelectObserver(): void {
        const overlayContainer = document.querySelector('.cdk-overlay-container');
        if (overlayContainer) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const element = node as Element;
                            // Check if this is a bounding-box that was just added
                            if (element.classList.contains('cdk-overlay-connected-position-bounding-box')) {
                                this.checkAndMarkPaginatorSelect(element);
                            } else {
                                // Check if bounding-box was added inside this element
                                const boundingBox = element.querySelector(
                                    '.cdk-overlay-connected-position-bounding-box'
                                );
                                if (boundingBox) {
                                    this.checkAndMarkPaginatorSelect(boundingBox);
                                }
                            }
                        }
                    });
                });
            });

            observer.observe(overlayContainer, {
                childList: true,
                subtree: true,
            });

            // Store observer for cleanup
            (this as any)._paginatorSelectObserver = observer;
        }
    }

    private checkAndMarkPaginatorSelect(box: Element): void {
        const selectPanel = box.querySelector('.mat-select-panel');

        if (selectPanel) {
            // Check if it's a permission-select-panel (has panelClass="permission-select-panel")
            const hasPermissionPanel = selectPanel.classList.contains('permission-select-panel');

            if (hasPermissionPanel) {
                // Mark as permission select for height: auto
                if (!box.classList.contains('permission-select-bounding-box')) {
                    box.classList.add('permission-select-bounding-box');
                }
            } else {
                // If not a permission panel, check if it's from a paginator
                const paginators = document.querySelectorAll('mat-paginator');
                let isFromPaginator = false;

                paginators.forEach((paginator) => {
                    // Check all possible ways to identify paginator selects
                    const selectTrigger = paginator.querySelector('.mat-select-trigger');
                    const pageSizeSelect = paginator.querySelector('.mat-paginator-page-size mat-select');

                    if (selectTrigger || pageSizeSelect) {
                        const trigger = selectTrigger || pageSizeSelect;
                        if (trigger) {
                            const ariaOwns = trigger.getAttribute('aria-owns');

                            // Check if this panel matches the paginator's select
                            if (ariaOwns && selectPanel.id) {
                                if (
                                    selectPanel.id === ariaOwns ||
                                    selectPanel.id.includes(ariaOwns) ||
                                    ariaOwns.includes(selectPanel.id)
                                ) {
                                    isFromPaginator = true;
                                }
                            }

                            // Also check by looking at the parent structure
                            if (!isFromPaginator) {
                                const pageSizeElement = paginator.querySelector('.mat-paginator-page-size');
                                if (pageSizeElement && pageSizeElement.contains(trigger as Node)) {
                                    // This is likely a paginator select
                                    isFromPaginator = true;
                                }
                            }
                        }
                    }
                });

                // Add class immediately if it's from paginator
                if (isFromPaginator && !box.classList.contains('paginator-select-bounding-box')) {
                    box.classList.add('paginator-select-bounding-box');
                }
            }
        }
    }
}
