import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { FeatureComponentStore } from '../../features/feature/feature.store';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IFeature } from '@proxy/models/features-model';
import { IPaginatedResponse } from '@proxy/models/root-models';
import { UserComponentStore } from '../user/user.store';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';

interface IRole {
    id: number;
    role: string;
    permissions: string;
    permissionsList: any[];
}

@Component({
    selector: 'proxy-management',
    templateUrl: './management.component.html',
    styleUrls: ['./management.component.scss'],
    providers: [FeatureComponentStore, UserComponentStore],
})
export class ManagementComponent implements OnInit, OnDestroy {
    public roleForm = new FormGroup({
        feature_id: new FormControl<string>(null, [Validators.required]),
    });
    public params: any = {
        itemsPerPage: 1000,
        pageNo: 1,
    };
    public roleSearchTerm: string = '';
    public permissionSearchTerm: string = '';
    public features$: Observable<IPaginatedResponse<IFeature[]>> = this.featureComponentStore.feature$;
    public roles$: Observable<IPaginatedResponse<any[]>> = this.userComponentStore.roles$;
    public createRole$: Observable<any> = this.userComponentStore.createRole$;
    public updateRole$: Observable<any> = this.userComponentStore.updateRole$;
    public deleteRole$: Observable<any> = this.userComponentStore.deleteRole$;
    public permissions$: Observable<IPaginatedResponse<any[]>> = this.userComponentStore.permissions$;
    public createPermission$: Observable<any> = this.userComponentStore.createPermission$;
    public deletePermission$: Observable<any> = this.userComponentStore.deletePermission$;
    public updatePermission$: Observable<any> = this.userComponentStore.updatePermission$;
    public features: IFeature[] = [];
    public rolesDisplayedColumns: string[] = ['role', 'permissions', 'actions'];
    public rolesDataSource = new MatTableDataSource<IRole>([]);
    public permissionsDisplayedColumns: string[] = ['permission', 'actions'];
    public permissionsDataSource = new MatTableDataSource<any>([]);
    public availablePermissions: any[] = [];
    public dialogRoleForm: FormGroup;
    public dialogPermissionForm: FormGroup;
    private dialogRef: MatDialogRef<any>;
    private destroy$ = new Subject<void>();
    public isEditMode: boolean = false;
    public editingRole: IRole | null = null;
    public isEditPermissionMode: boolean = false;
    public editingPermission: any | null = null;

    @ViewChild('addRoleDialogTemplate', { static: false }) addRoleDialogTemplate: TemplateRef<any>;
    @ViewChild('addPermissionDialogTemplate', { static: false }) addPermissionDialogTemplate: TemplateRef<any>;

    constructor(
        private featureComponentStore: FeatureComponentStore,
        private userComponentStore: UserComponentStore,
        private dialog: MatDialog
    ) {
        this.dialogRoleForm = new FormGroup({
            roleName: new FormControl('', [Validators.required]),
            permissions: new FormControl([], []),
            is_default: new FormControl(false),
        });
        this.dialogPermissionForm = new FormGroup({
            permissionName: new FormControl('', [Validators.required]),
        });
    }

    ngOnInit(): void {
        this.featureComponentStore.getFeature({ ...this.params });
        this.features$.subscribe((features) => {
            if (features) {
                this.filterFeatures(features.data);
            }
        });

        // Subscribe to roles data
        this.roles$.subscribe((roles) => {
            if (roles?.data) {
                this.rolesDataSource.data = roles.data.map((role: any) => {
                    const permissionsList = role.c_permissions || [];
                    const permissionsText = permissionsList.map((p: any) => p.name).join(', ');
                    return {
                        id: role.id,
                        role: role.name || role.role || '',
                        permissions: permissionsText,
                        permissionsList: permissionsList,
                        feature_configuration_id: role.feature_configuration_id,
                        is_default: role.is_default || false,
                    };
                });
            } else {
                this.rolesDataSource.data = [];
            }
        });
        this.permissions$.pipe(takeUntil(this.destroy$)).subscribe((permissions) => {
            if (permissions?.data) {
                this.availablePermissions = permissions.data;
                this.permissionsDataSource.data = permissions.data;
            } else {
                this.permissionsDataSource.data = [];
            }
        });
        this.createPermission$.pipe(takeUntil(this.destroy$)).subscribe((createPermission) => {
            if (createPermission) {
                const referenceId = this.roleForm.get('feature_id')?.value;
                if (referenceId) {
                    this.loadPermissions(referenceId, this.permissionSearchTerm);
                }
            }
        });
        this.deletePermission$.pipe(takeUntil(this.destroy$)).subscribe((deletePermission) => {
            if (deletePermission) {
                const referenceId = this.roleForm.get('feature_id')?.value;
                if (referenceId) {
                    this.loadPermissions(referenceId, this.permissionSearchTerm);
                }
            }
        });
        // Subscribe to feature selection changes
        this.roleForm.get('feature_id')?.valueChanges.subscribe((referenceId: string | null) => {
            if (referenceId) {
                // Reset search terms when feature changes
                this.roleSearchTerm = '';
                this.permissionSearchTerm = '';
                this.loadRoles(referenceId, this.roleSearchTerm);
                this.loadPermissions(referenceId, this.permissionSearchTerm);
            } else {
                this.rolesDataSource.data = [];
                this.roleSearchTerm = '';
                this.permissionSearchTerm = '';
            }
        });
        this.createRole$
            .pipe(
                filter((createRole) => !!createRole),
                takeUntil(this.destroy$)
            )
            .subscribe((createRole) => {
                const referenceId = this.roleForm.get('feature_id')?.value;
                if (referenceId) {
                    this.loadRoles(referenceId, this.roleSearchTerm);
                }
            });
        this.updateRole$
            .pipe(
                filter((updateRole) => !!updateRole),
                takeUntil(this.destroy$)
            )
            .subscribe((updateRole) => {
                const referenceId = this.roleForm.get('feature_id')?.value;
                if (referenceId) {
                    this.loadRoles(referenceId, this.roleSearchTerm);
                }
            });
        this.deleteRole$
            .pipe(
                filter((deleteRole) => !!deleteRole),
                takeUntil(this.destroy$)
            )
            .subscribe((deleteRole) => {
                const referenceId = this.roleForm.get('feature_id')?.value;
                if (referenceId) {
                    this.loadRoles(referenceId, this.roleSearchTerm);
                }
            });
        this.updatePermission$
            .pipe(
                filter((updatePermission) => !!updatePermission),
                takeUntil(this.destroy$)
            )
            .subscribe((updatePermission) => {
                const referenceId = this.roleForm.get('feature_id')?.value;
                if (referenceId) {
                    this.loadPermissions(referenceId, this.permissionSearchTerm);
                }
            });
    }

    private loadRoles(referenceId: string, searchTerm?: string): void {
        const params: any = { referenceId };
        if (searchTerm && searchTerm.trim()) {
            params.search = searchTerm.trim();
        }
        this.userComponentStore.getRoles(params);
    }
    private loadPermissions(referenceId: string, searchTerm?: string): void {
        const params: any = { referenceId };
        if (searchTerm && searchTerm.trim()) {
            params.search = searchTerm.trim();
        }
        this.userComponentStore.getPermissions(params);
    }

    public filterFeatures(features: IFeature[]): void {
        this.features = features.filter((feature) => feature.feature_id === 1);
    }

    public editRole(role: IRole): void {
        this.isEditMode = true;
        this.editingRole = role;

        // Pre-fill form with role data
        const permissionNames = role.permissionsList.map((p: any) => p.name);

        // Set role name first
        this.dialogRoleForm.patchValue({
            roleName: role.role,
            permissions: [],
            is_default: (role as any).is_default || false,
        });

        this.dialogRef = this.dialog.open(this.addRoleDialogTemplate, {
            width: '500px',
            autoFocus: false,
            restoreFocus: false,
        });

        // Set permissions after dialog opens to ensure availablePermissions is loaded
        // Only select permissions that match the role's permissionsList
        setTimeout(() => {
            const selectedPermissions = this.availablePermissions
                .filter((perm: any) => permissionNames.includes(perm.name))
                .map((perm: any) => perm.name);

            this.dialogRoleForm.patchValue({
                permissions: selectedPermissions,
            });
        }, 0);

        this.dialogRef.afterClosed().subscribe((payload) => {
            this.isEditMode = false;
            this.editingRole = null;
            if (payload) {
                this.userComponentStore.updateRole(of(payload));
            }
        });
    }

    public addRole(): void {
        this.isEditMode = false;
        this.editingRole = null;

        // Reset form
        this.dialogRoleForm.reset({
            roleName: '',
            permissions: [],
            is_default: false,
        });

        this.dialogRef = this.dialog.open(this.addRoleDialogTemplate, {
            width: '500px',
            autoFocus: false,
            restoreFocus: false,
        });

        this.dialogRef.afterClosed().subscribe((payload) => {
            if (payload) {
                this.userComponentStore.createRole(of(payload));
            }
        });
    }

    public submitDialog(): void {
        if (this.dialogRoleForm.valid) {
            const referenceId = this.roleForm.get('feature_id')?.value;
            const formData = this.dialogRoleForm.value;

            const payload: any = {
                name: formData.roleName,
                permissions: formData.permissions,
                referenceId: referenceId,
                is_default: formData.is_default || false,
            };

            // Add id for update mode
            if (this.isEditMode && this.editingRole) {
                payload.id = this.editingRole.id;
            }

            this.dialogRef.close(payload);
        }
    }

    public closeDialog(): void {
        this.dialogRef.close(false);
    }

    public deleteRole(role: IRole): void {
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent);
        const componentInstance = confirmDialogRef.componentInstance;
        componentInstance.confirmationMessage = `Are you sure you want to delete the role "${role.role}"?`;
        componentInstance.confirmButtonText = 'Delete';
        componentInstance.confirmButtonColor = 'warn';

        confirmDialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                const referenceId = this.roleForm.get('feature_id')?.value;
                const payload = {
                    id: role.id,
                    referenceId: referenceId,
                };
                this.userComponentStore.deleteRole(of(payload));
            }
        });
    }

    public addPermission(): void {
        this.isEditPermissionMode = false;
        this.editingPermission = null;

        // Reset form
        this.dialogPermissionForm.reset({
            permissionName: '',
        });

        this.dialogRef = this.dialog.open(this.addPermissionDialogTemplate, {
            width: '500px',
            autoFocus: false,
            restoreFocus: false,
        });

        this.dialogRef.afterClosed().subscribe((payload) => {
            if (payload) {
                this.userComponentStore.createPermission(of(payload));
            }
        });
    }

    public editPermission(permission: any): void {
        this.isEditPermissionMode = true;
        this.editingPermission = permission;

        // Pre-fill form with permission data
        this.dialogPermissionForm.patchValue({
            permissionName: permission.name,
        });

        this.dialogRef = this.dialog.open(this.addPermissionDialogTemplate, {
            width: '500px',
            autoFocus: false,
            restoreFocus: false,
        });

        this.dialogRef.afterClosed().subscribe((payload) => {
            this.isEditPermissionMode = false;
            this.editingPermission = null;
            if (payload) {
                this.userComponentStore.updatePermission(of(payload));
            }
        });
    }

    public submitPermissionDialog(): void {
        if (this.dialogPermissionForm.valid) {
            const referenceId = this.roleForm.get('feature_id')?.value;
            const formData = this.dialogPermissionForm.value;

            const payload: any = {
                name: formData.permissionName,
                referenceId: referenceId,
            };

            // Add id for update mode
            if (this.isEditPermissionMode && this.editingPermission) {
                payload.id = this.editingPermission.id;
            }

            this.dialogRef.close(payload);
        }
    }

    public closePermissionDialog(): void {
        this.dialogRef.close(false);
    }

    public deletePermission(permission: any): void {
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent);
        const componentInstance = confirmDialogRef.componentInstance;
        componentInstance.confirmationMessage = `Are you sure you want to delete the permission "${permission.name}"?`;
        componentInstance.confirmButtonText = 'Delete';
        componentInstance.confirmButtonColor = 'warn';

        confirmDialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                const referenceId = this.roleForm.get('feature_id')?.value;
                const payload = {
                    id: permission.id,
                    referenceId: referenceId,
                };
                this.userComponentStore.deletePermission(of(payload));
            }
        });
    }

    public search(event: any): void {
        this.roleSearchTerm = event || '';
        const referenceId = this.roleForm.get('feature_id')?.value;
        if (referenceId) {
            this.loadRoles(referenceId, this.roleSearchTerm);
        }
    }
    public searchPermission(event: any): void {
        this.permissionSearchTerm = event || '';
        const referenceId = this.roleForm.get('feature_id')?.value;
        if (referenceId) {
            this.loadPermissions(referenceId, this.permissionSearchTerm);
        }
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
