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
import { rolesData } from '../store/selectors';
import { isEqual } from 'lodash';
import { UserData, Role } from '../model/otp';

@Component({
    selector: 'proxy-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent extends BaseComponent implements OnInit, AfterViewInit {
    @Input() public userToken: string;
    @ViewChild('addUserDialog') addUserDialog!: TemplateRef<any>;
    @ViewChild('editPermissionDialog') editPermissionDialog!: TemplateRef<any>;
    @ViewChild('addPermissionDialog') addPermissionDialog!: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    private addUserDialogRef: any;
    private editPermissionDialogRef: any;
    private addPermissionDialogRef: any;
    public getRoles$: Observable<any>;
    public roles: any[] = [];
    public displayedColumns: string[] = ['name', 'email', 'role'];
    public dataSource = new MatTableDataSource<UserData>([]);
    public searchTerm: string = '';
    public filteredData: UserData[] = [];
    public emailVisibility: { [key: number]: boolean } = {};
    public addUserForm: FormGroup;
    public editPermissionForm: FormGroup;
    public addPermissionForm: FormGroup;
    public isEditRole: boolean = false;
    public currentEditingUser: UserData | null = null;
    public currentEditingPermission: UserData | null = null;
    public userData: UserData[] = [
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports', 'Database Admin'],
            additionalPermissions: ['API Access', 'Backup Management', 'Security Settings'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
            additionalPermissions: ['Export Data', 'Print Reports'],
        },
        {
            userId: '003',
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            role: 'Manager',
            permissions: ['User Management', 'View Reports', 'Edit Content', 'Moderate Comments'],
            additionalPermissions: ['Team Management', 'Budget Access'],
        },
        {
            userId: '004',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            role: 'Editor',
            permissions: ['Edit Content', 'View Reports', 'Publish Articles'],
            additionalPermissions: ['Media Upload', 'SEO Settings'],
        },
        {
            userId: '005',
            name: 'David Brown',
            email: 'david.brown@example.com',
            role: 'Viewer',
            permissions: ['Read Only'],
            additionalPermissions: ['Bookmark Content'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
        {
            userId: '001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
        },
        {
            userId: '002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            permissions: ['Read Only', 'View Reports'],
        },
    ];

    constructor(private fb: FormBuilder, private dialog: MatDialog, private store: Store<IAppState>) {
        super();
        this.getRoles$ = this.store.pipe(select(rolesData), distinctUntilChanged(isEqual), takeUntil(this.destroy$));
        this.addUserForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            mobileNumber: ['', [Validators.pattern(/^(\+?[1-9]\d{1,14}|[0-9]{10})$/)]],
            role: [''],
            permission: [[]],
        });

        this.editPermissionForm = this.fb.group({
            roleName: ['', Validators.required],
            description: ['', Validators.required],
            permission: [[], Validators.required],
            selectedPermission: ['', Validators.required],
            permissionName: ['', Validators.required],
        });
        this.addPermissionForm = this.fb.group({
            permission: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.getRoles$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.roles = res.data?.data;
            }
        });
        this.store.dispatch(otpActions.getRoles({ authToken: this.userToken }));
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
        this.isEditRole = true;
        this.currentEditingUser = user;
        const roleId = this.getRoleIdByName(user.role);
        this.addUserForm.patchValue({
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber || '',
            role: roleId || user.role,
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
        console.log('User data for tooltip:', user); // Debug log
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

        console.log('Tooltip text:', tooltipText); // Debug log
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
        const role = this.roles.find((role) => role.name === roleName);
        return role?.id;
    }

    addUser(): void {
        this.isEditRole = false;
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
    }

    saveUser(): void {
        if (this.addUserForm.valid) {
            const formValue = this.addUserForm.value;
            const selectedRole = formValue.role ? this.getRoleById(formValue.role) : null;
            const roleName = selectedRole?.name || formValue.role || 'User'; // Default to 'User' if no role selected

            if (this.isEditRole && this.currentEditingUser) {
                // Update existing user
                const userIndex = this.userData.findIndex((u) => u.userId === this.currentEditingUser!.userId);
                if (userIndex !== -1) {
                    this.userData[userIndex] = {
                        ...this.userData[userIndex],
                        name: formValue.name,
                        email: formValue.email,
                        mobileNumber: formValue.mobileNumber || '',
                        role: roleName,
                        permissions: this.getDefaultPermissions(roleName),
                    };
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

                this.userData.push(newUser);
                this.store.dispatch(
                    otpActions.addUser({ name: newUser.name, email: newUser.email, authToken: this.userToken })
                );
                console.log('New user added:', newUser);
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

    public editPermission(user: UserData): void {
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
                    name: `User with ${formValue.roleName} role`,
                    email: `user${this.userData.length + 1}@example.com`,
                    mobileNumber: '0000000000',
                    role: formValue.roleName,
                    permissions: formValue.permission,
                };

                this.userData.push(newUser);
                console.log('New role added:', newUser);
            }

            this.closePermissionDialog();
        }
    }

    addRole(): void {
        this.currentEditingPermission = null;
        this.editPermissionForm.reset();
        this.editPermissionDialogRef = this.dialog.open(this.editPermissionDialog, {
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
}
