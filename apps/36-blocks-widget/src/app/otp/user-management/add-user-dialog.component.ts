import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    computed,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { Subject, distinctUntilChanged, takeUntil } from 'rxjs';
import { isEqual } from 'lodash-es';
import { IAppState } from '../store/app.state';
import { otpActions } from '../store/actions';
import { rolesData, addUserSuccess } from '../store/selectors';
import { WidgetTheme } from '@proxy/constant';
import { WidgetDialogRef } from '../service/widget-dialog.service';
import { ToastService } from '../service/toast.service';
import { ToastComponent } from '../service/toast.component';

/**
 * Standalone Add-User dialog.
 * Opened exclusively via WidgetDialogService.open() — never instantiated
 * directly. WidgetDialogService handles shadow DOM isolation and CSS reset.
 */
@Component({
    selector: 'add-user-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ToastComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="w-dialog-backdrop" (click)="close()" aria-hidden="true"></div>
        <proxy-toast />
        <div role="dialog" aria-labelledby="add-user-dialog-title" aria-modal="true" class="w-dialog-panel">
            <!-- Header -->
            <div class="w-dialog-header">
                <h2 id="add-user-dialog-title" class="w-dialog-title">Add Member</h2>
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
                            @if (form.get('name')?.touched && form.get('name')?.hasError('pattern')) {
                                <p role="alert" class="w-field-error">
                                    Name must contain only letters, spaces, hyphens or apostrophes
                                </p>
                            }
                        </div>
                        <div>
                            <label for="au-role" class="w-label">Role</label>
                            <div class="relative">
                                <select id="au-role" formControlName="role" class="w-select">
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
                        }
                        @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
                            <p role="alert" class="w-field-error">Enter a valid email address</p>
                        }
                    </div>
                    <div>
                        <label for="au-mobile" class="w-label">
                            Mobile
                            <span class="font-normal" [class.text-gray-400]="!isDark()" [class.text-gray-500]="isDark()"
                                >(optional)</span
                            >
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
                        <p class="mt-1.5 text-xs" [class.text-gray-500]="!isDark()" [class.text-gray-400]="isDark()">
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
    /** Set by WidgetDialogService before onInit via setup callback. */
    authToken = '';
    theme = '';
    /** Injected by WidgetDialogService — used to close the dialog. */
    dialogRef!: WidgetDialogRef<AddUserDialogComponent>;

    readonly roles = signal<any[]>([]);
    form!: FormGroup;

    private readonly store = inject<Store<IAppState>>(Store);
    private readonly fb = inject(FormBuilder);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly actions$ = inject(Actions);
    private readonly toastService = inject(ToastService);
    private readonly _destroy$ = new Subject<void>();

    private readonly _systemDark = signal(
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    readonly isDark = computed(() => {
        if (this.theme === WidgetTheme.Dark) return true;
        if (this.theme === WidgetTheme.Light) return false;
        if (typeof document !== 'undefined') {
            const r = document.documentElement;
            const b = document.body;
            if (r.classList.contains('dark') || b.classList.contains('dark')) return true;
            if (r.getAttribute('data-theme') === 'dark' || b.getAttribute('data-theme') === 'dark') return true;
            if (r.getAttribute('data-mode') === 'dark' || b.getAttribute('data-mode') === 'dark') return true;
        }
        return this._systemDark();
    });

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.pattern(/^[\p{L}\s'-]+$/u)]],
            email: ['', [Validators.required, Validators.email]],
            mobileNumber: ['', [Validators.pattern(/^(\+?[1-9]\d{1,14}|[0-9]{10})$/)]],
            role: [''],
        });

        // Fetch roles for the dropdown
        this.store.dispatch(otpActions.getRoles({ authToken: this.authToken, itemsPerPage: 1000 }));

        this.store
            .pipe(select(rolesData), distinctUntilChanged(isEqual), takeUntil(this._destroy$))
            .subscribe((res) => {
                if (res?.data?.data?.length) {
                    this.roles.set(res.data.data);
                    // Default to the first role if the control has no value yet
                    if (!this.form.get('role')?.value) {
                        this.form.get('role')?.setValue(res.data.data[0].id.toString());
                    }
                    this.cdr.markForCheck();
                }
            });

        // Close only on confirmed success
        this.store
            .pipe(select(addUserSuccess), distinctUntilChanged(), takeUntil(this._destroy$))
            .subscribe((success) => {
                if (success) {
                    this.close();
                }
            });

        // Show error toast without closing the dialog
        this.actions$
            .pipe(ofType(otpActions.addUserError), takeUntil(this._destroy$))
            .subscribe(({ errorResponse }) => {
                const errorMessage: string =
                    errorResponse?.error?.errors?.message ||
                    errorResponse?.error?.data?.message ||
                    errorResponse?.errors?.message ||
                    errorResponse?.data?.message ||
                    errorResponse?.message ||
                    'Something went wrong. Please try again.';
                this.toastService.error(errorMessage);
            });

        // System dark mode changes
        if (typeof window !== 'undefined') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = (mediaQueryEvent: MediaQueryListEvent) => {
                this._systemDark.set(mediaQueryEvent.matches);
                this.cdr.markForCheck();
            };
            mq.addEventListener('change', listener);
            this._destroy$.subscribe({ complete: () => mq.removeEventListener('change', listener) });
        }
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    save(): void {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }
        const formValue = this.form.value;
        this.store.dispatch(
            otpActions.addUser({
                payload: {
                    user: { name: formValue.name, email: formValue.email, mobile: formValue.mobileNumber || '' },
                    role_id: formValue.role,
                },
                authToken: this.authToken,
            })
        );
    }

    close(): void {
        this.dialogRef?.close();
    }
}
