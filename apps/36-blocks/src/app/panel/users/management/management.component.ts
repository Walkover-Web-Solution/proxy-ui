import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    ViewChild,
    TemplateRef,
    inject,
    Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { ServiceListComponent } from '@proxy/ui/service-list';
import { NoRecordFoundComponent } from '@proxy/ui/no-record-found';
import { MatPaginatorGotoComponent } from '@proxy/ui/mat-paginator-goto';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';
import { CopyButtonComponent } from '@proxy/ui/copy-button';
import { MarkdownModule } from 'ngx-markdown';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { FeatureComponentStore } from '../../features/feature/feature.store';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IFeature, ProxyUserManagementScript } from '@proxy/models/features-model';
import { environment } from '../../../../environments/environment';
import { IPaginatedResponse } from '@proxy/models/root-models';
import { UserComponentStore } from '../user/user.store';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PROXY_DOM_ID } from '@proxy/constant';
import { MatChipsModule } from '@angular/material/chips';
import { SearchComponent } from '@proxy/ui/search';

interface IRole {
    id: number;
    role: string;
    permissions: string;
    permissionsList: any[];
    description?: string;
    is_hidden?: boolean;
    feature_configuration_id?: number;
    is_default?: boolean;
}

interface ITestIdentity {
    email?: string;
    mobile?: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-management',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatListModule,
        MatCardModule,
        MatPaginatorModule,
        ServiceListComponent,
        NoRecordFoundComponent,
        MatPaginatorGotoComponent,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatDividerModule,
        CopyButtonComponent,
        MarkdownModule,
        MatChipsModule,
        SearchComponent,
    ],
    templateUrl: './management.component.html',
    styleUrls: ['./management.component.scss'],
    providers: [FeatureComponentStore, UserComponentStore],
})
export class ManagementComponent implements OnInit, OnDestroy, OnChanges {
    private featureComponentStore = inject(FeatureComponentStore);
    private userComponentStore = inject(UserComponentStore);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);

    public roleForm = new FormGroup({
        feature_id: new FormControl<string>(null, [Validators.required]),
        id: new FormControl<number>(null),
    });
    public params: any = {
        itemsPerPage: 100,
        pageNo: 1,
    };
    /** Current block `reference_id` when embedded (e.g. feature edit). Not the feature type id. */
    @Input() referenceId: string | null = null;
    public roleSearchTerm: string = '';
    public permissionSearchTerm: string = '';
    public rolesPageSize: number = 25;
    public permissionsPageSize: number = 100;
    public rolesPageIndex: number = 0;
    public permissionsPageIndex: number = 0;
    public rolesTotalCount: number = 0;
    public permissionsTotalCount: number = 0;
    public pageSizeOptions: number[] = [25, 50, 100];
    public features: IFeature[] = [];
    public featureDetails: any;
    public rolesDisplayedColumns: string[] = ['role', 'permissions', 'actions'];
    public rolesDataSource = new MatTableDataSource<IRole>([]);
    public permissionsDisplayedColumns: string[] = ['permission', 'actions'];
    public permissionsDataSource = new MatTableDataSource<any>([]);
    public availablePermissions: any[] = [];
    public dialogRoleForm: FormGroup;
    public dialogPermissionForm: FormGroup;
    public dialogTestUserForm: FormGroup;
    public defaultRolesForm: FormGroup;
    /** Backend caps test_identities at 50 entries. */
    public readonly maxTestIdentities = 50;
    public testIdentities: ITestIdentity[] = [];
    public testIdentitiesDisplayedColumns: string[] = ['email', 'mobile', 'actions'];
    public testIdentitiesDataSource = new MatTableDataSource<ITestIdentity>([]);
    public roleCards: {
        icon: string;
        title: string;
        desc: string;
        controlName: string;
        label: string;
        multiple: boolean;
        options: { value: string; label: string }[] | null;
    }[] = [
        {
            icon: 'person_add',
            title: 'Default role for creator',
            desc: 'Assigned after creating an organization.',
            controlName: 'defaultRoleForCreator',
            label: 'Select default role for creator',
            multiple: false,
            options: null,
        },
        {
            icon: 'group_add',
            title: 'Default role for member',
            desc: 'Assigned to new organization members.',
            controlName: 'defaultRoleForMember',
            label: 'Select default role for member',
            multiple: false,
            options: null,
        },
        {
            icon: 'visibility_off',
            title: 'Hidden roles',
            desc: 'Select default roles to hide from users.',
            controlName: 'hiddenDefaultRoles',
            label: 'Select roles to hide',
            multiple: true,
            options: [
                { value: 'owner', label: 'Owner' },
                { value: 'user', label: 'User' },
            ],
        },
    ];
    private dialogRef: MatDialogRef<any>;
    private destroy$ = new Subject<void>();
    public isEditMode: boolean = false;
    public editingRole: IRole | null = null;
    public isEditPermissionMode: boolean = false;
    public editingPermission: any | null = null;
    public selectedSectionIndex: number = 0;
    public readonly managementSections = [
        { name: 'Roles', icon: 'person' },
        { name: 'Permissions', icon: 'shield' },
        { name: 'Snippet', icon: 'code' },
        { name: 'Testing Users', icon: 'person_add' },
        { name: 'Settings', icon: 'settings' },
    ];
    public features$: Observable<IPaginatedResponse<IFeature[]>> = this.featureComponentStore.feature$;
    public roles$: Observable<IPaginatedResponse<any[]>> = this.userComponentStore.roles$;
    public createRole$: Observable<any> = this.userComponentStore.createRole$;
    public updateRole$: Observable<any> = this.userComponentStore.updateRole$;
    public deleteRole$: Observable<any> = this.userComponentStore.deleteRole$;
    public permissions$: Observable<IPaginatedResponse<any[]>> = this.userComponentStore.permissions$;
    public createPermission$: Observable<any> = this.userComponentStore.createPermission$;
    public deletePermission$: Observable<any> = this.userComponentStore.deletePermission$;
    public updatePermission$: Observable<any> = this.userComponentStore.updatePermission$;
    public featureDetails$: Observable<any> = this.userComponentStore.featureDetails$;

    public get userManagementScript(): string {
        const referenceId = this.roleForm.get('feature_id')?.value;
        return ProxyUserManagementScript(environment.proxyServer, referenceId || '<auth_token>');
    }

    public get proxyDomId(): string {
        return PROXY_DOM_ID;
    }

    public get userProxyContainerHtml(): string {
        return `<div id="${PROXY_DOM_ID}"></div>`;
    }

    @ViewChild('addRoleDialogTemplate', { static: false }) addRoleDialogTemplate: TemplateRef<any>;
    @ViewChild('addPermissionDialogTemplate', { static: false }) addPermissionDialogTemplate: TemplateRef<any>;
    @ViewChild('addTestUserDialogTemplate', { static: false }) addTestUserDialogTemplate: TemplateRef<any>;

    constructor() {
        this.dialogRoleForm = new FormGroup({
            roleName: new FormControl('', [Validators.required]),
            permissions: new FormControl([], []),
            description: new FormControl('', []),
            is_default: new FormControl(false),
        });
        this.dialogPermissionForm = new FormGroup({
            permissionName: new FormControl('', [Validators.required]),
            description: new FormControl('', []),
        });
        this.dialogTestUserForm = new FormGroup(
            {
                email: new FormControl('', [Validators.email]),
                mobile: new FormControl('', [Validators.maxLength(20)]),
            },
            { validators: (group: AbstractControl): ValidationErrors | null => this.atLeastOneContactValidator(group) }
        );
        this.defaultRolesForm = new FormGroup({
            defaultRoleForCreator: new FormControl('', []),
            defaultRoleForMember: new FormControl('', []),
            hiddenDefaultRoles: new FormControl([], []),
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['referenceId'] && this.referenceId && changes['referenceId'].firstChange === false) {
            this.roleForm.patchValue({ feature_id: this.referenceId }, { emitEvent: true });
            this.cdr.markForCheck();
        }
    }

    ngOnInit(): void {
        this.featureComponentStore.getFeature({ ...this.params });
        this.features$.pipe(takeUntil(this.destroy$)).subscribe((features) => {
            if (features) {
                this.filterFeatures(features.data);
                const referenceId = this.roleForm.get('feature_id')?.value as string | null;
                if (referenceId) {
                    this.bindSelectedFeatureByReferenceId(referenceId);
                }
                this.cdr.markForCheck();
            }
        });

        // Subscribe to roles data
        this.roles$.subscribe((roles: any) => {
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
                        is_hidden: !!role.is_hidden,
                        description: role.description || '',
                    };
                });
                // Update pagination info from response
                this.rolesTotalCount = roles.totalEntityCount || roles.data.length;
            } else {
                this.rolesDataSource.data = [];
                this.rolesTotalCount = 0;
            }
            this.cdr.markForCheck();
        });
        this.permissions$.pipe(takeUntil(this.destroy$)).subscribe((permissions: any) => {
            if (permissions?.data) {
                this.availablePermissions = permissions.data;
                this.permissionsDataSource.data = permissions.data;
                // Update pagination info from response
                this.permissionsTotalCount = permissions.totalEntityCount || permissions.data.length;
            } else {
                this.permissionsDataSource.data = [];
                this.permissionsTotalCount = 0;
            }
            this.cdr.markForCheck();
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
        this.userComponentStore.featureDetails$.subscribe((featureDetails) => {
            this.featureDetails = featureDetails;
            if (this.featureDetails) {
                const cRoles = this.featureDetails.extra_configurations?.c_roles || {};
                const hiddenRoles: string[] = [];
                if (cRoles.hide_default_creator_role) {
                    hiddenRoles.push('owner');
                }
                if (cRoles.hide_default_member_role) {
                    hiddenRoles.push('user');
                }
                this.defaultRolesForm.patchValue({
                    defaultRoleForCreator: cRoles.default_creator_role,
                    defaultRoleForMember: cRoles.default_member_role,
                    hiddenDefaultRoles: hiddenRoles,
                });
                this.setTestIdentities(this.featureDetails.extra_configurations?.test_identities);
                this.cdr.markForCheck();
            }
        });
        // Subscribe to feature selection changes
        this.roleForm.get('feature_id')?.valueChanges.subscribe((referenceId: string | null) => {
            if (referenceId) {
                this.bindSelectedFeatureByReferenceId(referenceId);
                // Reset search terms and page indices when feature changes
                this.roleSearchTerm = '';
                this.permissionSearchTerm = '';
                this.rolesPageIndex = 0;
                this.permissionsPageIndex = 0;
                this.loadRoles(referenceId, this.roleSearchTerm);
                this.loadPermissions(referenceId, this.permissionSearchTerm);
            } else {
                this.roleForm.get('id')?.setValue(null, { emitEvent: false });
                this.rolesDataSource.data = [];
                this.roleSearchTerm = '';
                this.permissionSearchTerm = '';
                this.rolesPageIndex = 0;
                this.permissionsPageIndex = 0;
            }
        });
        if (this.referenceId) {
            this.roleForm.patchValue({ feature_id: this.referenceId }, { emitEvent: true });
        }
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
        // Refresh feature details after a successful feature update so cached
        // extra_configurations (test_identities, default roles) stay in sync.
        this.userComponentStore.createUpdateObject$
            .pipe(
                filter((updated) => !!updated),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                if (this.featureDetails?.id) {
                    this.userComponentStore.getFeatureDetails(of(this.featureDetails.id));
                }
            });
    }

    private loadRoles(referenceId: string, searchTerm?: string): void {
        const params: any = {
            referenceId,
            itemsPerPage: this.rolesPageSize,
            pageNo: this.rolesPageIndex + 1, // API uses 1-based page number
        };
        if (searchTerm && searchTerm.trim()) {
            params.search = searchTerm.trim();
        }
        this.userComponentStore.getRoles(of(params));
    }
    private loadPermissions(referenceId: string, searchTerm?: string): void {
        const params: any = {
            referenceId,
            itemsPerPage: this.permissionsPageSize,
            pageNo: this.permissionsPageIndex + 1, // API uses 1-based page number
        };
        if (searchTerm && searchTerm.trim()) {
            params.search = searchTerm.trim();
        }
        this.userComponentStore.getPermissions(of(params));
    }

    public onRolesPageChange(event: PageEvent): void {
        this.rolesPageSize = event.pageSize;
        this.rolesPageIndex = event.pageIndex;
        const referenceId = this.roleForm.get('feature_id')?.value;
        if (referenceId) {
            this.loadRoles(referenceId, this.roleSearchTerm);
        }
    }

    public onPermissionsPageChange(event: PageEvent): void {
        this.permissionsPageSize = event.pageSize;
        this.permissionsPageIndex = event.pageIndex;
        const referenceId = this.roleForm.get('feature_id')?.value;
        if (referenceId) {
            this.loadPermissions(referenceId, this.permissionSearchTerm);
        }
    }

    public filterFeatures(features: IFeature[]): void {
        this.features = features.filter((feature) => feature.feature_id === 1);
    }

    /** Loads full feature details for Settings / default roles save. Call after `features` is populated (embed flow can set `feature_id` before the list arrives). */
    private bindSelectedFeatureByReferenceId(referenceId: string): void {
        const selectedFeature = this.features.find((f) => f.reference_id === referenceId);
        if (!selectedFeature) {
            return;
        }
        this.roleForm.get('id')?.setValue(selectedFeature.id, { emitEvent: false });
        if (!this.featureDetails || this.featureDetails.id !== selectedFeature.id) {
            this.userComponentStore.getFeatureDetails(of(selectedFeature.id));
        }
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
            description: role.description || '',
            is_default: (role as any).is_default || false,
        });

        this.dialogRef = this.dialog.open(this.addRoleDialogTemplate, {
            panelClass: ['mat-dialog'],
            autoFocus: true,
            restoreFocus: false,
        });
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
            description: '',
            is_default: false,
        });

        this.dialogRef = this.dialog.open(this.addRoleDialogTemplate, {
            panelClass: ['mat-dialog'],
            autoFocus: true,
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
                description: formData.description || '',
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

    /**
     * Toggle role visibility via PUT /:referenceId/cRoles/:id with { is_hidden }.
     * Checked (enabled) => is_hidden: false; unchecked (disabled) => is_hidden: true.
     */
    public toggleRoleVisibility(role: IRole, event: MatSlideToggleChange): void {
        const referenceId = this.roleForm.get('feature_id')?.value;
        if (!referenceId || !role?.id) {
            event.source.checked = !event.checked;
            return;
        }
        const is_hidden = !event.checked;
        role.is_hidden = is_hidden;
        this.userComponentStore.updateRole(
            of({
                id: role.id,
                referenceId,
                is_hidden,
            })
        );
    }

    public deleteRole(role: IRole): void {
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        confirmDialogRef.componentRef.setInput(
            'confirmationMessage',
            `Are you sure you want to delete the role "${role.role}"?`
        );
        confirmDialogRef.componentRef.setInput('confirmButtonText', 'Delete');
        confirmDialogRef.componentRef.setInput('confirmButtonColor', 'warn');

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
            description: '',
        });

        this.dialogRef = this.dialog.open(this.addPermissionDialogTemplate, {
            panelClass: ['mat-dialog'],
            autoFocus: true,
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
            description: permission.description || '',
        });

        this.dialogRef = this.dialog.open(this.addPermissionDialogTemplate, {
            panelClass: ['mat-dialog'],
            autoFocus: true,
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
                description: formData.description || '',
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
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        confirmDialogRef.componentRef.setInput(
            'confirmationMessage',
            `Are you sure you want to delete the permission "${permission.name}"?`
        );
        confirmDialogRef.componentRef.setInput('confirmButtonText', 'Delete');
        confirmDialogRef.componentRef.setInput('confirmButtonColor', 'warn');

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
        this.rolesPageIndex = 0; // Reset to first page on search
        const referenceId = this.roleForm.get('feature_id')?.value;
        if (referenceId) {
            this.loadRoles(referenceId, this.roleSearchTerm);
        }
    }
    public searchPermission(event: any): void {
        this.permissionSearchTerm = event || '';
        this.permissionsPageIndex = 0; // Reset to first page on search
        const referenceId = this.roleForm.get('feature_id')?.value;
        if (referenceId) {
            this.loadPermissions(referenceId, this.permissionSearchTerm);
        }
    }
    public saveDefaultRoles(): void {
        if (!this.defaultRolesForm.valid || !this.featureDetails?.id) {
            return;
        }
        const formData = this.defaultRolesForm.value;
        const hiddenRoles: string[] = formData.hiddenDefaultRoles || [];

        const payload: any = {
            id: this.featureDetails.id,
            body: {
                extra_configurations: {
                    c_roles: {
                        default_creator_role: formData.defaultRoleForCreator,
                        default_member_role: formData.defaultRoleForMember,
                        hide_default_creator_role: hiddenRoles.includes('owner'),
                        hide_default_member_role: hiddenRoles.includes('user'),
                    },
                    default_role: {
                        name: 'Owner',
                        value: 1,
                    },
                },
            },
        };
        this.userComponentStore.updateFeature(of(payload));
    }

    public cancelDefaultRoles(): void {
        this.defaultRolesForm.reset({
            defaultRoleForCreator: '',
            defaultRoleForMember: '',
            hiddenDefaultRoles: [],
        });
    }

    /** Group validator: a test identity must have at least one of email / mobile. */
    private atLeastOneContactValidator(group: AbstractControl): ValidationErrors | null {
        const email = (group.get('email')?.value || '').trim();
        const mobile = (group.get('mobile')?.value || '').trim();
        return email || mobile ? null : { atLeastOneContact: true };
    }

    private setTestIdentities(identities: ITestIdentity[] | undefined | null): void {
        this.testIdentities = Array.isArray(identities) ? identities.map((entry) => ({ ...entry })) : [];
        this.testIdentitiesDataSource.data = this.testIdentities;
    }

    public addTestUser(): void {
        if (this.testIdentities.length >= this.maxTestIdentities) {
            return;
        }
        this.dialogTestUserForm.reset({ email: '', mobile: '' });
        this.dialogRef = this.dialog.open(this.addTestUserDialogTemplate, {
            panelClass: ['mat-dialog'],
            autoFocus: true,
            restoreFocus: false,
        });
        this.dialogRef.afterClosed().subscribe((entry: ITestIdentity | false) => {
            if (entry) {
                this.setTestIdentities([...this.testIdentities, entry]);
                this.persistTestIdentities();
            }
        });
    }

    public submitTestUserDialog(): void {
        if (!this.dialogTestUserForm.valid) {
            return;
        }
        const { email, mobile } = this.dialogTestUserForm.value;
        const entry: ITestIdentity = {};
        const trimmedEmail = (email || '').trim();
        const trimmedMobile = (mobile || '').trim();
        if (trimmedEmail) {
            entry.email = trimmedEmail;
        }
        if (trimmedMobile) {
            entry.mobile = trimmedMobile;
        }
        this.dialogRef.close(entry);
    }

    public closeTestUserDialog(): void {
        this.dialogRef.close(false);
    }

    public removeTestUser(entry: ITestIdentity): void {
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        const label = entry.email || entry.mobile || 'this test user';
        confirmDialogRef.componentRef.setInput(
            'confirmationMessage',
            `Are you sure you want to remove "${label}" from test users?`
        );
        confirmDialogRef.componentRef.setInput('confirmButtonText', 'Remove');
        confirmDialogRef.componentRef.setInput('confirmButtonColor', 'warn');

        confirmDialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                this.setTestIdentities(this.testIdentities.filter((item) => item !== entry));
                this.persistTestIdentities();
            }
        });
    }

    /**
     * Persists the FULL test_identities list. The backend merges list values by
     * index, so the complete desired array must be sent on every change.
     */
    private persistTestIdentities(): void {
        if (!this.featureDetails?.id) {
            return;
        }
        const payload = {
            id: this.featureDetails.id,
            body: {
                extra_configurations: {
                    test_identities: this.testIdentities,
                },
            },
        };
        this.userComponentStore.updateFeature(of(payload));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
