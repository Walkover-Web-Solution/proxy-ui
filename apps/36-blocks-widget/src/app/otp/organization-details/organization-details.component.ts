import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    computed,
    inject,
    input,
    signal,
} from '@angular/core';
import { PublicScriptTheme } from '@proxy/constant';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from 'libs/ui/base-component/src/lib/base-component/base.component';
import { OtpService } from '../service/otp.service';
import { finalize, takeUntil } from 'rxjs';
import { EMAIL_REGEX } from '@proxy/regex';

@Component({
    selector: 'organization-details',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './organization-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./organization-details.component.scss'],
})
export class OrganizationDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
    public authToken = input<string>();
    public theme = input<string>();
    protected readonly PublicScriptTheme = PublicScriptTheme;

    private readonly _systemDark = signal(
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    readonly isDark = computed(() => {
        const t = this.theme();
        if (t === PublicScriptTheme.Dark) return true;
        if (t === PublicScriptTheme.Light) return false;
        return this._systemDark();
    });

    public organizationForm = new FormGroup({
        companyName: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
        email: new FormControl<string>('', [Validators.required, Validators.pattern(EMAIL_REGEX)]),
        phoneNumber: new FormControl<string>('', [Validators.pattern(/^$|^[0-9]{10,15}$/)]),
        timezone: new FormControl<string>(''),
        timeZoneName: new FormControl<string>(''),
    });

    public updateInProgress = false;

    /** Timezone options from API (e.g. { value: string, label?: string }[] or string[]) */
    public timezones: any[] = [];

    // ── NEW: controls view vs edit mode ──────────────────────────
    public isEditing = false;
    // ─────────────────────────────────────────────────────────────

    private initialFormValue: {
        companyName: string;
        email: string;
        phoneNumber: string;
        timezone: string;
        timeZoneName: string;
    } | null = null;

    // Snapshot taken when the user clicks Edit, so Cancel can restore it
    private editSnapshot: typeof this.initialFormValue = null;

    private otpService = inject(OtpService);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        super();
    }

    public allowedUpdatePermissions: boolean = false;
    public toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);
    private toastTimer: ReturnType<typeof setTimeout> | null = null;

    ngOnInit(): void {
        if (this.authToken()) {
            this.otpService
                .getOrganizationDetails(this.authToken())
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        const company = res?.data?.[0]?.currentCompany;
                        this.allowedUpdatePermissions =
                            res?.data?.[0]?.currentCompany?.permissions?.includes('update_c_company');
                        if (company && typeof company === 'object') {
                            const timeZoneName =
                                company.timeZoneName ??
                                this.timezones.find((tz) => tz?.offset === company.timezone)?.label ??
                                '';
                            const value = {
                                companyName: company.name ?? '',
                                email: company.email ?? '',
                                phoneNumber: company.mobile ?? '',
                                timezone: company.timezone ?? '',
                                timeZoneName: timeZoneName ?? '',
                            };
                            this.organizationForm.patchValue(value);
                            this.initialFormValue = value;
                            this.cdr.markForCheck();
                        }
                    },
                    error: () => {},
                });

            this.otpService
                .getTimezones(this.authToken())
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        const raw = res?.data ?? res;
                        if (Array.isArray(raw)) {
                            this.timezones = res.data;
                        }
                    },
                    error: () => {},
                });
        }
        this.organizationForm
            .get('timeZoneName')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((value) => {
                this.organizationForm
                    .get('timezone')
                    ?.setValue(this.timezones.find((tz) => tz?.label === value)?.offset ?? '');
            });
    }

    ngOnDestroy(): void {
        if (this.toastTimer) clearTimeout(this.toastTimer);
        super.ngOnDestroy();
    }

    private showToast(message: string, type: 'success' | 'error'): void {
        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toast.set({ message, type });
        this.cdr.markForCheck();
        this.toastTimer = setTimeout(() => {
            this.toast.set(null);
            this.cdr.markForCheck();
        }, 3000);
    }

    // ── NEW: enter edit mode ──────────────────────────────────────
    public startEdit(): void {
        // Snapshot current values so Cancel can restore them
        this.editSnapshot = { ...this.organizationForm.value } as typeof this.initialFormValue;
        this.isEditing = true;
    }

    // ── NEW: cancel and restore form to pre-edit state ────────────
    public cancelEdit(): void {
        if (this.editSnapshot) {
            this.organizationForm.patchValue(this.editSnapshot);
        }
        this.organizationForm.markAsPristine();
        this.organizationForm.markAsUntouched();
        this.isEditing = false;
    }

    public getTimezoneValue(tz): string {
        return typeof tz === 'string' ? tz : tz.label ?? '';
    }

    public getTimezoneLabel(tz): string {
        return typeof tz === 'string' ? tz : tz.label ?? '';
    }

    public onSubmit(): void {
        if (!this.organizationForm.valid || !this.authToken() || this.updateInProgress) {
            this.organizationForm.markAllAsTouched();
            return;
        }

        const organizationDetails = this.organizationForm.getRawValue();
        const current = {
            companyName: organizationDetails.companyName ?? '',
            email: organizationDetails.email ?? '',
            phoneNumber: organizationDetails.phoneNumber ?? '',
            timezone: organizationDetails.timezone ?? '',
            timeZoneName: organizationDetails.timeZoneName ?? '',
        };

        // No-op if nothing changed
        if (
            this.initialFormValue &&
            this.initialFormValue.companyName === current.companyName &&
            this.initialFormValue.email === current.email &&
            this.initialFormValue.phoneNumber === current.phoneNumber &&
            this.initialFormValue.timezone === current.timezone &&
            this.initialFormValue.timeZoneName === current.timeZoneName
        ) {
            this.isEditing = false; // just close edit mode silently
            return;
        }

        this.updateInProgress = true;
        this.cdr.markForCheck();
        this.otpService
            .updateCompany(this.authToken(), {
                name: organizationDetails.companyName ?? '',
                email: organizationDetails.email ?? '',
                mobile: organizationDetails.phoneNumber ?? '',
                timezone: organizationDetails.timezone ?? '',
                timeZoneName: organizationDetails.timeZoneName ?? '',
            })
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                    this.updateInProgress = false;
                    this.cdr.markForCheck();
                })
            )
            .subscribe({
                next: (res) => {
                    this.initialFormValue = { ...current };
                    this.isEditing = false;
                    this.showToast(res?.data?.message ?? 'Company updated successfully.', 'success');
                    this.cdr.markForCheck();
                    window.dispatchEvent(
                        new CustomEvent('organizationDetailsUpdateResponse', {
                            bubbles: true,
                            composed: true,
                            detail: { data: res?.data, error: false },
                        })
                    );
                },
                error: (error) => {
                    this.showToast('Something went wrong. Please try again.', 'error');
                    this.cdr.markForCheck();
                    window.dispatchEvent(
                        new CustomEvent('organizationDetailsUpdateResponse', {
                            bubbles: true,
                            composed: true,
                            detail: { data: error?.error?.errors ?? error?.error ?? error, error: true },
                        })
                    );
                },
            });
    }
}
