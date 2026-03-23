import {
    ApplicationRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    DestroyRef,
    EnvironmentInjector,
    OnDestroy,
    OnInit,
    computed,
    createComponent,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store, select } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs';
import { isEqual } from 'lodash-es';
import { IAppState } from '../store/app.state';
import { otpActions } from '../store/actions';
import { rolesData, addUserData } from '../store/selectors';
import { WidgetTheme } from '@proxy/constant';
import { ensureAddUserDialogStyles } from '../service/widget-portal.service';

/**
 * Fully standalone Add-User dialog that mounts itself directly onto
 * document.body so it is never blocked by a parent stacking context.
 *
 * Lifecycle:
 *   1. Call AddUserDialogComponent.open(appRef, injector, config) to create.
 *   2. The dialog appends its own host <div> to document.body.
 *   3. On close the host is removed and the ComponentRef is destroyed.
 */
@Component({
    selector: 'add-user-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="w-dialog-backdrop" (click)="close()" aria-hidden="true"></div>
        <div role="dialog" aria-labelledby="add-user-dialog-title" aria-modal="true" class="w-dialog-panel">
            <!-- Header -->
            <div class="w-dialog-header">
                <h2 id="add-user-dialog-title" class="text-base font-semibold text-gray-900 dark:text-white">
                    Add Member
                </h2>
                <button type="button" (click)="close()" class="w-btn-close" aria-label="Close dialog">
                    <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                            d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                        />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="w-dialog-body space-y-5">
                <form [formGroup]="form" class="space-y-5">
                    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label for="au-name" class="w-label">
                                Full name <span class="text-red-500" aria-hidden="true">*</span>
                            </label>
                            <input
                                id="au-name"
                                formControlName="name"
                                type="text"
                                placeholder="Jane Smith"
                                class="w-input"
                            />
                            @if (form.get('name')?.touched && form.get('name')?.hasError('required')) {
                            <p role="alert" class="w-field-error">Name is required</p>
                            }
                        </div>
                        <div>
                            <label for="au-role" class="w-label">Role</label>
                            <div class="relative">
                                <select id="au-role" formControlName="role" class="w-select">
                                    <option value="">Select role</option>
                                    @for (r of roles(); track r.id) {
                                    <option [value]="r.id.toString()">{{ r.name }}</option>
                                    }
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                                    <svg class="size-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fill-rule="evenodd"
                                            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label for="au-email" class="w-label">
                            Email address <span class="text-red-500" aria-hidden="true">*</span>
                        </label>
                        <input
                            id="au-email"
                            formControlName="email"
                            type="email"
                            placeholder="jane@company.com"
                            class="w-input"
                        />
                        @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
                        <p role="alert" class="w-field-error">Email is required</p>
                        } @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
                        <p role="alert" class="w-field-error">Enter a valid email address</p>
                        }
                    </div>
                    <div>
                        <label for="au-mobile" class="w-label">
                            Mobile <span class="font-normal text-gray-400 dark:text-gray-500">(optional)</span>
                        </label>
                        <input
                            id="au-mobile"
                            formControlName="mobileNumber"
                            type="tel"
                            placeholder="917001002003"
                            class="w-input"
                        />
                        @if (form.get('mobileNumber')?.touched && form.get('mobileNumber')?.hasError('pattern')) {
                        <p role="alert" class="w-field-error">Enter a valid mobile with country code</p>
                        }
                        <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                            Include country code, e.g. 917001002003
                        </p>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <div class="w-dialog-footer">
                <button type="button" (click)="close()" class="w-btn-secondary">Cancel</button>
                <button type="button" (click)="save()" [disabled]="form.invalid" class="w-btn-primary">
                    Add Member
                </button>
            </div>
        </div>
    `,
})
export class AddUserDialogComponent implements OnInit, OnDestroy {
    /** Config passed by the bridge service before the component is attached. */
    authToken = '';
    theme = '';

    readonly roles = signal<any[]>([]);
    form!: FormGroup;

    private readonly store = inject<Store<IAppState>>(Store);
    private readonly fb = inject(FormBuilder);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);

    /** The host element appended to document.body. */
    private _hostEl: HTMLDivElement | null = null;
    /** Self-reference so we can destroy from within. */
    private _selfRef: ComponentRef<AddUserDialogComponent> | null = null;

    private readonly _systemDark = signal(
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    readonly isDark = computed(() => {
        if (this.theme === WidgetTheme.Dark) return true;
        if (this.theme === WidgetTheme.Light) return false;
        return this._systemDark();
    });

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            mobileNumber: ['', [Validators.pattern(/^(\+?[1-9]\d{1,14}|[0-9]{10})$/)]],
            role: [''],
        });

        // Keep host element dark class in sync
        if (this._hostEl) {
            this._hostEl.classList.toggle('dark', this.isDark());
        }

        // Fetch roles for the dropdown
        this.store.dispatch(otpActions.getRoles({ authToken: this.authToken, itemsPerPage: 1000 }));

        this.store
            .pipe(select(rolesData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res?.data?.data) {
                    this.roles.set(res.data.data);
                    this.cdr.markForCheck();
                }
            });

        // Close on success
        this.store
            .pipe(select(addUserData), distinctUntilChanged(isEqual), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                if (res) {
                    this.close();
                }
            });

        // System dark mode changes
        if (typeof window !== 'undefined') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = (e: MediaQueryListEvent) => {
                this._systemDark.set(e.matches);
                if (this._hostEl) {
                    this._hostEl.classList.toggle('dark', this.isDark());
                }
                this.cdr.markForCheck();
            };
            mq.addEventListener('change', listener);
            this.destroyRef.onDestroy(() => mq.removeEventListener('change', listener));
        }
    }

    ngOnDestroy(): void {
        this._hostEl?.remove();
        this._hostEl = null;
    }

    save(): void {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }
        const v = this.form.value;
        this.store.dispatch(
            otpActions.addUser({
                payload: {
                    user: { name: v.name, email: v.email, mobile: v.mobileNumber || '' },
                    role_id: v.role,
                },
                authToken: this.authToken,
            })
        );
    }

    close(): void {
        if (this._selfRef) {
            this._selfRef.destroy();
            this._selfRef = null;
        }
    }

    /**
     * Factory: dynamically creates the component, appends it to body, and returns the ref.
     */
    static open(
        appRef: ApplicationRef,
        injector: EnvironmentInjector,
        config: { authToken: string; theme: string }
    ): ComponentRef<AddUserDialogComponent> {
        ensureAddUserDialogStyles();

        const host = document.createElement('div');
        host.setAttribute('data-widget-overlay', '');
        host.classList.toggle(
            'dark',
            (() => {
                if (config.theme === WidgetTheme.Dark) return true;
                if (config.theme === WidgetTheme.Light) return false;
                return window.matchMedia('(prefers-color-scheme: dark)').matches;
            })()
        );
        document.body.appendChild(host);

        const ref = createComponent(AddUserDialogComponent, {
            environmentInjector: injector,
            hostElement: host,
        });

        ref.instance.authToken = config.authToken;
        ref.instance.theme = config.theme;
        ref.instance._hostEl = host;
        ref.instance._selfRef = ref;

        appRef.attachView(ref.hostView);
        ref.changeDetectorRef.detectChanges();

        return ref;
    }
}
