import { Component, Input, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../store/app.state';
import { BaseComponent } from '@proxy/ui/base-component';
import { otpActions } from '../store/actions';
import { distinctUntilChanged, Observable, takeUntil } from 'rxjs';
import {
    addUserData,
    companyUsersData,
    permissionCreateData,
    permissionData,
    roleCreateData,
    rolesData,
    updateCompanyUserData,
} from '../store/selectors';
import { isEqual } from 'lodash';
import { UserData, Role } from '../model/otp';

@Component({
    selector: 'proxy-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent extends BaseComponent implements OnInit, AfterViewInit {
    @Input() public userToken: string;
    @Input() public pass: string;
    @ViewChild('addUserDialog') addUserDialog!: TemplateRef<any>;
    @ViewChild('editPermissionDialog') editPermissionDialog!: TemplateRef<any>;
    @ViewChild('addPermissionDialog') addPermissionDialog!: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    private addUserDialogRef: any;
    private editPermissionDialogRef: any;
    private addPermissionDialogRef: any;
    public getRoles$: Observable<any>;
    public getPermissions$: Observable<any>;
    public getCompanyUsers$: Observable<any>;
    public getRoleCreate$: Observable<any>;
    public getPermissionCreate$: Observable<any>;
    public addUserData$: Observable<any>;
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
            console.log('res', res);
            if (res) {
                this.permissions = res.data.data;
                this.filteredPermissionsData = [...this.permissions];
                this.permissionsDataSource.data = this.filteredPermissionsData;
            }
        });
        this.getCompanyUsers$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
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
            }
        });
        this.getPermissionCreate$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.getPermissions();
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
    }

    editUser(user: UserData, index: number): void {
        this.isEditUser = true;
        this.isEditRole = false;
        this.isEditPermission = false;
        this.currentEditingUser = user;
        const roleId = this.getRoleIdByName(user.role);

        // Get permission IDs for the user's current permissions
        const userPermissionIds = this.getPermissionIdsByName(user.permissions || []);

        // Set all form values at once to avoid triggering role change during initial setup
        this.addUserForm.patchValue({
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber || '',
            role: roleId || user.role,
            permission: userPermissionIds,
        });

        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            disableClose: true,
        });
    }

    deleteUser(user: UserData, index: number): void {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            this.userData.splice(index, 1);
            this.applyFilter(); // Reapply filter after deletion
        }
    }

    getPermissionsTooltip(user: UserData): string {
        let tooltipText = '';

        if (user && user.permissions && user.permissions.length > 0) {
            const permissionsText = user.permissions.join('\n• ');
            tooltipText = `Permissions:\n• ${permissionsText}`;
        } else {
            tooltipText = 'No permissions assigned';
        }

        if (user && user.additionalPermissions && user.additionalPermissions.length > 0) {
            const additionalPermissionsText = user.additionalPermissions.join('\n+ ');
            tooltipText += `\n\nAdditional Permissions:\n+ ${additionalPermissionsText}`;
        }

        return tooltipText;
    }

    applyFilter(): void {
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

    clearSearch(): void {
        this.searchTerm = '';
        this.applyFilter();
    }

    maskEmail(email: string): string {
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

    getEmailDisplay(email: string, index: number): string {
        return this.isEmailVisible(index) ? email : this.maskEmail(email);
    }

    isEmailVisible(index: number): boolean {
        return this.emailVisibility[index] || false;
    }

    toggleEmailVisibility(index: number): void {
        this.emailVisibility[index] = !this.emailVisibility[index];
    }

    getRoleIdByName(roleName: string): number | undefined {
        if (!this.roles || !Array.isArray(this.roles)) {
            console.warn('Roles not loaded yet, returning undefined');
            return undefined;
        }

        const role = this.roles.find((role) => role.name === roleName);
        return role?.id;
    }

    onRoleChange(roleId: number): void {
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

    getPermissionIdsByName(permissionNames: string[]): number[] {
        return permissionNames
            .map((permissionName) => {
                const permission = this.permissions.find((p) => p.name === permissionName);
                return permission?.id;
            })
            .filter((id) => id !== undefined) as number[];
    }

    getPermissionNamesByIds(permissionIds: number[]): string[] {
        return permissionIds
            .map((permissionId) => {
                const permission = this.permissions.find((p) => p.id === permissionId);
                return permission?.name;
            })
            .filter((name) => name !== undefined) as string[];
    }

    addUser(): void {
        this.isEditUser = false;
        this.isEditRole = false;
        this.isEditPermission = false;
        this.currentEditingUser = null;
        this.addUserForm.reset();
        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            disableClose: true,
        });
    }

    closeDialog(): void {
        if (this.addUserDialogRef) {
            this.addUserDialogRef.close();
        }
        // Reset all edit flags
        this.isEditUser = false;
        this.isEditRole = false;
        this.isEditPermission = false;
        this.currentEditingUser = null;
        this.currentEditingPermission = null;
    }

    saveUser(): void {
        debugger;
        if (this.addUserForm.valid) {
            const formValue = this.addUserForm.value;
            const selectedRole = formValue.role ? this.getRoleById(formValue.role) : null;
            const roleName = selectedRole?.name || formValue.role || 'User'; // Default to 'User' if no role selected

            if ((this.isEditUser || this.isEditRole) && this.currentEditingUser) {
                // Update existing user
                const userIndex = this.userData.findIndex((u) => u.userId === this.currentEditingUser!.userId);
                if (userIndex !== -1) {
                    // Create a new array with the updated user
                    this.userData = this.userData.map((user, index) =>
                        index === userIndex
                            ? {
                                  ...user,
                                  name: formValue.name,
                                  email: formValue.email,
                                  mobileNumber: formValue.mobileNumber || '',
                                  role: roleName,
                                  permissions: this.getDefaultPermissions(roleName),
                              }
                            : user
                    );
                    const payload = {
                        user: {
                            name: formValue.name,
                            mobile: formValue.mobileNumber || '',
                        },
                        cpermissions: formValue.permission,
                        role_id: formValue.role,
                    };
                    this.store.dispatch(otpActions.updateCompanyUser({ payload, authToken: this.userToken }));
                }
                console.log('User updated:', this.userData[userIndex]);
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
                console.log('newUser', newUser);

                // Add to local array for immediate UI update
                this.userData = [...this.userData, newUser];

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

    getRoleById(roleId: number): Role | undefined {
        return this.roles.find((role) => role.id === roleId);
    }

    private getDefaultPermissions(role: string): string[] {
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

    onPermissionSelected(selectedPermission: string): void {
        this.editPermissionForm.patchValue({
            permissionName: selectedPermission,
        });
    }

    closePermissionDialog(): void {
        if (this.editPermissionDialogRef) {
            this.editPermissionDialogRef.close();
        }
    }

    savePermission(): void {
        debugger;
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
                    console.log('Permission name updated:', this.userData[userIndex]);
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

    addRole(): void {
        this.isEditRole = true;
        this.isEditPermission = false;
        this.currentEditingUser = null;
        this.addRoleForm.reset();
        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            disableClose: true,
        });
    }

    addPermission(): void {
        this.addPermissionDialogRef = this.dialog.open(this.addPermissionDialog, {
            width: '500px',
            disableClose: true,
        });
    }

    closeAddPermissionDialog(): void {
        this.addPermissionDialogRef.close();
    }

    saveAddPermission(): void {
        console.log('saveAddPermission');
    }

    // New methods for tab forms
    saveAddRole(): void {
        if (this.addRoleForm.valid) {
            const formValue = this.addRoleForm.value;

            // Convert permission IDs to permission names
            const permissionNames = this.getPermissionNamesByIds(formValue.permission);

            if (this.isEditRole && this.currentEditingUser) {
                // Update existing role
                console.log('Updating role:', this.currentEditingUser, 'with new data:', formValue);
                // TODO: Implement role update logic
            } else {
                // Add new role
                console.log('Adding new role:', formValue);
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

    saveAddPermissionTab(): void {
        if (this.addPermissionTabForm.valid) {
            const formValue = this.addPermissionTabForm.value;

            if (this.isEditPermission && this.currentEditingPermission) {
                // Update existing permission
                console.log('Updating permission:', this.currentEditingPermission, 'with new data:', formValue);
                // TODO: Implement permission update logic
            } else {
                // Add new permission
                console.log('Adding new permission:', formValue);
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
    getCompanyUsers(): void {
        this.store.dispatch(otpActions.getCompanyUsers({ authToken: this.userToken }));
    }
    getRoles(): void {
        this.store.dispatch(otpActions.getRoles({ authToken: this.userToken }));
    }
    getPermissions(): void {
        this.store.dispatch(otpActions.getPermissions({ authToken: this.userToken }));
    }

    // Role management methods
    applyRoleFilter(): void {
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

    openAddRoleDialog(): void {
        // Open the existing add role dialog
        this.addRole();
    }

    editRole(role: any, index: number): void {
        // Set the current editing role
        this.currentEditingUser = role;
        this.isEditRole = true;
        this.isEditPermission = false;

        // Get permission IDs from the role's permissions
        const permissionIds = role.c_permissions ? role.c_permissions.map((p: any) => p.id) : [];

        console.log('Editing role:', role);
        console.log('Role permissions:', role.c_permissions);
        console.log('Permission IDs to set:', permissionIds);

        // Populate the addRoleForm with the role data
        this.addRoleForm.patchValue({
            roleName: role.name,
            description: `Description for ${role.name} role`,
            permission: permissionIds,
        });

        // Verify the form was updated correctly
        console.log('Form permission value after patch:', this.addRoleForm.get('permission')?.value);

        // Open the add user dialog (which contains the role form)
        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            disableClose: true,
        });
    }

    // Permission management methods
    applyPermissionFilter(): void {
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

    openAddPermissionDialog(): void {
        this.isEditPermission = true;
        this.isEditRole = false;
        this.currentEditingPermission = null;
        this.addPermissionTabForm.reset();
        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            disableClose: true,
        });
    }

    editPermission(permission: any, index: number): void {
        this.currentEditingPermission = permission;
        this.isEditPermission = true;
        this.isEditRole = false;

        this.addPermissionTabForm.patchValue({
            permission: permission.name,
            description: `Description for ${permission.name} permission`,
        });

        this.addUserDialogRef = this.dialog.open(this.addUserDialog, {
            width: '500px',
            disableClose: true,
        });
    }

    // Dialog helper methods
    getDialogTitle(): string {
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

    getSaveAction(): void {
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

    getFormInvalid(): boolean {
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

    getSaveButtonText(): string {
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
}
