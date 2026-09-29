import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { PageEvent } from '@angular/material/paginator';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInput, MatChipInputEvent } from '@angular/material/chips';
import { ServiceListComponent } from '@proxy/ui/service-list';
import { NoRecordFoundComponent } from '@proxy/ui/no-record-found';
import { MatPaginatorGotoComponent } from '@proxy/ui/mat-paginator-goto';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';
import { SearchComponent } from '@proxy/ui/search';
import { CopyButtonComponent } from '@proxy/ui/copy-button';
import { BUILTIN_OAUTH_SCOPES, IBlockScope, IOAuthConfig, OAuthClientType } from '@proxy/models/features-model';
import { Subject, filter, takeUntil } from 'rxjs';
import { OauthConfigComponentStore } from './oauth-config.store';
import { PAGE_SIZE_OPTIONS } from '@proxy/constant';

const SCOPE_KEY_PATTERN = /^[a-z0-9_]+(:[a-z0-9_]+)*$/;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-oauth-config',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
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
        MatChipsModule,
        MatSlideToggleModule,
        MatMenuModule,
        MatDividerModule,
        SearchComponent,
        CopyButtonComponent,
    ],
    templateUrl: './oauth-config.component.html',
    styleUrls: ['./oauth-config.component.scss'],
    providers: [OauthConfigComponentStore],
})
export class OauthConfigComponent implements OnInit, OnChanges, OnDestroy {
    private store = inject(OauthConfigComponentStore);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    /** Numeric feature configuration id (`features/{id}/...`). */
    @Input() featureId: number | null = null;

    public selectedSectionIndex = 0;
    public readonly oauthSections = [
        { name: 'OAuth', icon: 'vpn_key' },
        { name: 'Scope', icon: 'tune' },
    ];
    public readonly clientTypes: { value: OAuthClientType; label: string }[] = [
        { value: 'confidential', label: 'Confidential' },
        { value: 'public', label: 'Public' },
    ];
    public readonly chipListSeparatorKeysCodes = [ENTER, COMMA];
    public readonly builtinScopes = BUILTIN_OAUTH_SCOPES;
    /** Local chip list for template (OnPush + dialog-safe); synced to form `redirect_uris`. */
    public redirectUriChips: string[] = [];

    public pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;

    public oauthSearchTerm = '';
    public oauthPageSize = 25;
    public oauthPageIndex = 0;
    public oauthTotalCount = 0;
    public oauthDisplayedColumns: string[] = ['name', 'clientId', 'clientType', 'scopes', 'status', 'actions'];
    public oauthDataSource = new MatTableDataSource<IOAuthConfig>([]);

    public scopeSearchTerm = '';
    public scopePageSize = 25;
    public scopePageIndex = 0;
    public scopeTotalCount = 0;
    public scopeDisplayedColumns: string[] = ['key', 'label', 'actions'];
    public scopeDataSource = new MatTableDataSource<IBlockScope>([]);

    public dialogOauthForm: FormGroup;
    public dialogScopeForm: FormGroup;
    public isEditOauthMode = false;
    public isEditScopeMode = false;
    public editingOauth: IOAuthConfig | null = null;
    public editingScope: IBlockScope | null = null;
    public revealedSecret: string | null = null;
    public revealedClientId: string | null = null;

    private blockScopeCatalog: IBlockScope[] = [];
    private oauthDialogRef: MatDialogRef<any>;
    private scopeDialogRef: MatDialogRef<any>;
    private secretDialogRef: MatDialogRef<any>;
    /** When true, newly created scopes are selected in the open OAuth dialog. */
    private selectCreatedScopeInOauthForm = false;

    @ViewChild('addOauthDialogTemplate', { static: false }) addOauthDialogTemplate: TemplateRef<any>;
    @ViewChild('addScopeDialogTemplate', { static: false }) addScopeDialogTemplate: TemplateRef<any>;
    @ViewChild('secretRevealDialogTemplate', { static: false }) secretRevealDialogTemplate: TemplateRef<any>;

    constructor() {
        this.dialogOauthForm = new FormGroup({
            name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            client_type: new FormControl<OAuthClientType>('confidential', [Validators.required]),
            pkce_required: new FormControl(true),
            allowed_scopes: new FormControl<string[]>([], [Validators.required, Validators.minLength(1)]),
            redirect_uris: new FormControl<string[]>([]),
        });
        this.dialogScopeForm = new FormGroup({
            key: new FormControl('', [Validators.required, Validators.pattern(SCOPE_KEY_PATTERN)]),
            label: new FormControl('', [Validators.required, Validators.maxLength(255)]),
        });

        this.dialogOauthForm
            .get('client_type')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((clientType: OAuthClientType) => {
                this.syncPkceForClientType(clientType);
            });
    }

    ngOnInit(): void {
        this.store.oauthConfigs$.pipe(takeUntil(this.destroy$)).subscribe((page) => {
            this.oauthDataSource.data = page?.data ?? [];
            this.oauthTotalCount = page?.totalEntityCount ?? 0;
            this.cdr.markForCheck();
        });

        this.store.blockScopes$.pipe(takeUntil(this.destroy$)).subscribe((page) => {
            this.scopeDataSource.data = page?.data ?? [];
            this.scopeTotalCount = page?.totalEntityCount ?? 0;
            this.cdr.markForCheck();
        });

        this.store.blockScopeCatalog$.pipe(takeUntil(this.destroy$)).subscribe((catalog) => {
            this.blockScopeCatalog = catalog ?? [];
            this.cdr.markForCheck();
        });

        this.store.createOauthConfig$
            .pipe(
                filter((c): c is IOAuthConfig => !!c),
                takeUntil(this.destroy$)
            )
            .subscribe((created) => {
                this.oauthPageIndex = 0;
                this.reloadAll();
                if (created.client_secret) {
                    this.openSecretReveal(created.client_secret, created.client_id);
                }
            });

        this.store.updateOauthConfig$
            .pipe(
                filter((c) => !!c),
                takeUntil(this.destroy$)
            )
            .subscribe(() => this.loadOauthConfigs());

        this.store.deleteOauthConfig$
            .pipe(
                filter((c) => !!c),
                takeUntil(this.destroy$)
            )
            .subscribe(() => this.loadOauthConfigs());

        this.store.disableOauthConfig$
            .pipe(
                filter((c) => !!c),
                takeUntil(this.destroy$)
            )
            .subscribe(() => this.loadOauthConfigs());

        this.store.regenerateSecret$
            .pipe(
                filter((c): c is IOAuthConfig => !!c),
                takeUntil(this.destroy$)
            )
            .subscribe((updated) => {
                this.loadOauthConfigs();
                if (updated.client_secret) {
                    this.openSecretReveal(updated.client_secret, updated.client_id);
                }
            });

        this.store.createBlockScope$
            .pipe(
                filter((c): c is IBlockScope => !!c),
                takeUntil(this.destroy$)
            )
            .subscribe((created) => {
                this.scopePageIndex = 0;
                this.loadBlockScopes();
                this.loadBlockScopeCatalog();
                if (this.selectCreatedScopeInOauthForm && created.key) {
                    const control = this.dialogOauthForm.get('allowed_scopes');
                    const current: string[] = [...(control?.value || [])];
                    if (!current.includes(created.key)) {
                        control?.setValue([...current, created.key]);
                        control?.markAsDirty();
                    }
                    this.selectCreatedScopeInOauthForm = false;
                    this.cdr.markForCheck();
                }
            });

        this.store.updateBlockScope$
            .pipe(
                filter((c) => !!c),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.loadBlockScopes();
                this.loadBlockScopeCatalog();
            });

        this.store.deleteBlockScope$
            .pipe(
                filter((c) => !!c),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.loadBlockScopes();
                this.loadBlockScopeCatalog();
            });

        if (this.featureId) {
            this.reloadAll();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['featureId'] && this.featureId && !changes['featureId'].firstChange) {
            this.reloadAll();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Built-in + block catalog keys for the allowed_scopes picker. */
    public get availableScopeOptions(): { key: string; label: string }[] {
        const custom = this.blockScopeCatalog.map((s) => ({ key: s.key, label: s.label }));
        return [...this.builtinScopes, ...custom];
    }

    public searchOauth(event: string): void {
        this.oauthSearchTerm = event || '';
        this.oauthPageIndex = 0;
        this.loadOauthConfigs();
    }

    public onOauthPageChange(event: PageEvent): void {
        this.oauthPageSize = event.pageSize;
        this.oauthPageIndex = event.pageIndex;
        this.loadOauthConfigs();
    }

    public addOauth(): void {
        if (!this.featureId) {
            return;
        }
        this.isEditOauthMode = false;
        this.editingOauth = null;
        this.redirectUriChips = [];
        this.dialogOauthForm.reset({
            name: '',
            client_type: 'confidential',
            pkce_required: true,
            allowed_scopes: [],
            redirect_uris: [],
        });
        this.dialogOauthForm.get('client_type')?.enable({ emitEvent: false });
        this.syncPkceForClientType('confidential');
        this.oauthDialogRef = this.dialog.open(this.addOauthDialogTemplate, {
            panelClass: ['mat-dialog'],
            autoFocus: true,
            restoreFocus: false,
        });
        this.oauthDialogRef.afterClosed().subscribe((payload) => {
            this.selectCreatedScopeInOauthForm = false;
            if (payload && this.featureId) {
                this.store.createOauthConfig({ featureId: this.featureId, body: payload });
            }
        });
    }

    public editOauth(config: IOAuthConfig): void {
        if (!this.featureId) {
            return;
        }
        this.isEditOauthMode = true;
        this.editingOauth = config;
        this.redirectUriChips = [...(config.redirect_uris || [])];
        this.dialogOauthForm.patchValue(
            {
                name: config.name,
                client_type: config.client_type,
                pkce_required: config.client_type === 'public' ? true : config.pkce_required,
                allowed_scopes: [...(config.allowed_scopes || [])],
                redirect_uris: [...this.redirectUriChips],
            },
            { emitEvent: false }
        );
        this.dialogOauthForm.get('client_type')?.disable({ emitEvent: false });
        this.syncPkceForClientType(config.client_type);
        this.oauthDialogRef = this.dialog.open(this.addOauthDialogTemplate, {
            panelClass: ['mat-dialog'],
            autoFocus: true,
            restoreFocus: false,
        });
        this.oauthDialogRef.afterClosed().subscribe((payload) => {
            this.selectCreatedScopeInOauthForm = false;
            this.dialogOauthForm.get('client_type')?.enable({ emitEvent: false });
            this.dialogOauthForm.get('pkce_required')?.enable({ emitEvent: false });
            if (payload && this.editingOauth && this.featureId) {
                this.store.updateOauthConfig({
                    featureId: this.featureId,
                    oauthConfigId: this.editingOauth.id,
                    body: {
                        name: payload.name,
                        pkce_required: payload.pkce_required,
                        allowed_scopes: payload.allowed_scopes,
                        redirect_uris: payload.redirect_uris,
                    },
                });
            }
            this.isEditOauthMode = false;
            this.editingOauth = null;
        });
    }

    public deleteOauth(config: IOAuthConfig): void {
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        confirmDialogRef.componentRef.setInput(
            'confirmationMessage',
            `Are you sure you want to delete the OAuth config "${config.name}"?`
        );
        confirmDialogRef.componentRef.setInput('confirmButtonText', 'Delete');
        confirmDialogRef.componentRef.setInput('confirmButtonColor', 'warn');

        confirmDialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes' && this.featureId) {
                this.store.deleteOauthConfig({ featureId: this.featureId, oauthConfigId: config.id });
            }
        });
    }

    public disableOauth(config: IOAuthConfig): void {
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        confirmDialogRef.componentRef.setInput(
            'confirmationMessage',
            `Disable "${config.name}"? This revokes all active grants and refresh tokens immediately.`
        );
        confirmDialogRef.componentRef.setInput('confirmButtonText', 'Disable');
        confirmDialogRef.componentRef.setInput('confirmButtonColor', 'warn');

        confirmDialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes' && this.featureId) {
                this.store.disableOauthConfig({ featureId: this.featureId, oauthConfigId: config.id });
            }
        });
    }

    public enableOauth(config: IOAuthConfig): void {
        if (!this.featureId || config.status === 'active') {
            return;
        }
        this.store.updateOauthConfig({
            featureId: this.featureId,
            oauthConfigId: config.id,
            body: { status: 'active' },
        });
    }

    public regenerateSecret(config: IOAuthConfig): void {
        if (config.client_type !== 'confidential') {
            return;
        }
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        confirmDialogRef.componentRef.setInput(
            'confirmationMessage',
            `Regenerate secret for "${config.name}"? The current secret stops working immediately.`
        );
        confirmDialogRef.componentRef.setInput('confirmButtonText', 'Regenerate');
        confirmDialogRef.componentRef.setInput('confirmButtonColor', 'warn');

        confirmDialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes' && this.featureId) {
                this.store.regenerateOauthSecret({ featureId: this.featureId, oauthConfigId: config.id });
            }
        });
    }

    public submitOauthDialog(): void {
        if (!this.dialogOauthForm.valid) {
            return;
        }
        const raw = this.dialogOauthForm.getRawValue();
        this.oauthDialogRef.close({
            name: raw.name,
            client_type: raw.client_type,
            pkce_required: !!raw.pkce_required,
            allowed_scopes: raw.allowed_scopes || [],
            redirect_uris: [...this.redirectUriChips],
        });
    }

    public closeOauthDialog(): void {
        this.oauthDialogRef.close(false);
    }

    public addRedirectUri(event: MatChipInputEvent): void {
        const parts = (event.value || '')
            .split(/[,\n]+/)
            .map((part) => part.trim())
            .filter(Boolean);
        const chipInput: MatChipInput | undefined = event.chipInput;
        if (!parts.length) {
            chipInput?.clear();
            return;
        }
        let changed = false;
        for (const uri of parts) {
            if (!this.redirectUriChips.includes(uri)) {
                this.redirectUriChips = [...this.redirectUriChips, uri];
                changed = true;
            }
        }
        if (changed) {
            this.syncRedirectUrisControl();
        }
        chipInput?.clear();
        this.cdr.detectChanges();
    }

    public removeRedirectUri(uri: string): void {
        this.redirectUriChips = this.redirectUriChips.filter((u) => u !== uri);
        this.syncRedirectUrisControl();
        this.cdr.detectChanges();
    }

    private syncRedirectUrisControl(): void {
        this.dialogOauthForm.get('redirect_uris')?.setValue([...this.redirectUriChips]);
        this.dialogOauthForm.get('redirect_uris')?.updateValueAndValidity();
    }

    public searchScope(event: string): void {
        this.scopeSearchTerm = event || '';
        this.scopePageIndex = 0;
        this.loadBlockScopes();
    }

    public onScopePageChange(event: PageEvent): void {
        this.scopePageSize = event.pageSize;
        this.scopePageIndex = event.pageIndex;
        this.loadBlockScopes();
    }

    public addScope(): void {
        this.openScopeDialog(false);
    }

    /** Opens create-scope dialog from the OAuth Allowed scopes field. */
    public addScopeFromOauthForm(event?: Event, select?: MatSelect): void {
        event?.preventDefault();
        event?.stopPropagation();
        select?.close();
        this.openScopeDialog(true);
    }

    private openScopeDialog(fromOauthForm: boolean): void {
        if (!this.featureId) {
            return;
        }
        this.selectCreatedScopeInOauthForm = fromOauthForm;
        this.isEditScopeMode = false;
        this.editingScope = null;
        this.dialogScopeForm.reset({ key: '', label: '' });
        this.dialogScopeForm.get('key')?.enable();
        this.scopeDialogRef = this.dialog.open(this.addScopeDialogTemplate, {
            panelClass: ['mat-dialog'],
            autoFocus: true,
            restoreFocus: false,
        });
        this.scopeDialogRef.afterClosed().subscribe((payload) => {
            if (!payload) {
                this.selectCreatedScopeInOauthForm = false;
                return;
            }
            if (this.featureId) {
                this.store.createBlockScope({ featureId: this.featureId, body: payload });
            }
        });
    }

    public editScope(scope: IBlockScope): void {
        if (!this.featureId) {
            return;
        }
        this.selectCreatedScopeInOauthForm = false;
        this.isEditScopeMode = true;
        this.editingScope = scope;
        this.dialogScopeForm.patchValue({ key: scope.key, label: scope.label });
        this.dialogScopeForm.get('key')?.disable();
        this.scopeDialogRef = this.dialog.open(this.addScopeDialogTemplate, {
            panelClass: ['mat-dialog'],
            autoFocus: true,
            restoreFocus: false,
        });
        this.scopeDialogRef.afterClosed().subscribe((payload) => {
            this.dialogScopeForm.get('key')?.enable();
            if (payload && this.editingScope && this.featureId) {
                this.store.updateBlockScope({
                    featureId: this.featureId,
                    blockScopeId: this.editingScope.id,
                    body: { label: payload.label },
                });
            }
            this.isEditScopeMode = false;
            this.editingScope = null;
        });
    }

    public deleteScope(scope: IBlockScope): void {
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        confirmDialogRef.componentRef.setInput(
            'confirmationMessage',
            `Are you sure you want to delete the scope "${scope.key}"? OAuth configs that still list this key will keep a dangling reference.`
        );
        confirmDialogRef.componentRef.setInput('confirmButtonText', 'Delete');
        confirmDialogRef.componentRef.setInput('confirmButtonColor', 'warn');

        confirmDialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes' && this.featureId) {
                this.store.deleteBlockScope({ featureId: this.featureId, blockScopeId: scope.id });
            }
        });
    }

    public submitScopeDialog(): void {
        if (!this.dialogScopeForm.valid) {
            return;
        }
        const raw = this.dialogScopeForm.getRawValue();
        this.scopeDialogRef.close({
            key: raw.key,
            label: raw.label,
        });
    }

    public closeScopeDialog(): void {
        this.scopeDialogRef.close(false);
    }

    public closeSecretReveal(): void {
        this.revealedSecret = null;
        this.revealedClientId = null;
        this.secretDialogRef?.close();
        this.secretDialogRef = null;
    }

    private openSecretReveal(secret: string, clientId?: string): void {
        this.revealedSecret = secret;
        this.revealedClientId = clientId || null;
        this.secretDialogRef = this.dialog.open(this.secretRevealDialogTemplate, {
            panelClass: ['mat-dialog'],
            disableClose: true,
        });
        this.cdr.markForCheck();
    }

    private syncPkceForClientType(clientType: OAuthClientType): void {
        const pkceControl = this.dialogOauthForm.get('pkce_required');
        if (!pkceControl) {
            return;
        }
        if (clientType === 'public') {
            pkceControl.setValue(true, { emitEvent: false });
            pkceControl.disable({ emitEvent: false });
        } else {
            pkceControl.enable({ emitEvent: false });
        }
        this.cdr.markForCheck();
    }

    private reloadAll(): void {
        this.loadOauthConfigs();
        this.loadBlockScopes();
        this.loadBlockScopeCatalog();
    }

    private loadOauthConfigs(): void {
        if (!this.featureId) {
            return;
        }
        this.store.getOauthConfigs({
            featureId: this.featureId,
            itemsPerPage: this.oauthPageSize,
            pageNo: this.oauthPageIndex + 1,
            search: this.oauthSearchTerm,
        });
    }

    private loadBlockScopes(): void {
        if (!this.featureId) {
            return;
        }
        this.store.getBlockScopes({
            featureId: this.featureId,
            itemsPerPage: this.scopePageSize,
            pageNo: this.scopePageIndex + 1,
            search: this.scopeSearchTerm,
        });
    }

    private loadBlockScopeCatalog(): void {
        if (!this.featureId) {
            return;
        }
        this.store.getBlockScopeCatalog(this.featureId);
    }
}
