import { Input, OnDestroy, OnInit } from '@angular/core';

import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from 'libs/ui/base-component/src/lib/base-component/base.component';
import { OtpService } from '../service/otp.service';
import { finalize, takeUntil } from 'rxjs';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { EMAIL_REGEX } from '@proxy/regex';

@Component({
    selector: 'organization-details',
    templateUrl: './organization-details.component.html',
    encapsulation: ViewEncapsulation.ShadowDom,
    styleUrls: ['../../../styles.scss', './organization-details.component.scss'],
})
export class OrganizationDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() public authToken: string;
    @Input() public theme: string;

    public organizationForm = new FormGroup({
        companyName: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
        email: new FormControl<string>('', [Validators.required, Validators.pattern(EMAIL_REGEX)]),
        phoneNumber: new FormControl<string>('', [Validators.pattern(/^$|^[0-9]{10,15}$/)]),
        timezone: new FormControl<string>('', [Validators.required]),
        timeZoneName: new FormControl<string>('', [Validators.required]),
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

    constructor(private otpService: OtpService, private snackBar: MatSnackBar) {
        super();
    }

    public allowedUpdatePermissions: boolean = false;

    ngOnInit(): void {
        if (this.authToken) {
            this.otpService
                .getOrganizationDetails(this.authToken)
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
                        }
                    },
                    error: () => {},
                });

            this.otpService
                .getTimezones(this.authToken)
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
        super.ngOnDestroy();
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
        if (!this.organizationForm.valid || !this.authToken || this.updateInProgress) {
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
        this.otpService
            .updateCompany(this.authToken, {
                name: organizationDetails.companyName ?? '',
                email: organizationDetails.email ?? '',
                mobile: organizationDetails.phoneNumber ?? '',
                timezone: organizationDetails.timezone ?? '',
                timeZoneName: organizationDetails.timeZoneName ?? '',
            })
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.updateInProgress = false))
            )
            .subscribe({
                next: (res) => {
                    this.initialFormValue = { ...current };
                    this.isEditing = false; // ← close edit mode on success
                    // this.snackBar.open(res?.data?.message ?? 'Information successfully updated', '✕', {
                    //     duration: 3000,
                    //     horizontalPosition: 'center',
                    //     verticalPosition: 'top',
                    //     panelClass: ['success-snackbar'],
                    // });
                    window.dispatchEvent(
                        new CustomEvent('organizationDetailsUpdateResponse', {
                            bubbles: true,
                            composed: true,
                            detail: { data: res?.data, error: false },
                        })
                    );
                },
                error: (error) => {
                    // Stay in edit mode so user can retry
                    // this.snackBar.open('Something went wrong', '✕', {
                    //     duration: 3000,
                    //     horizontalPosition: 'center',
                    //     verticalPosition: 'top',
                    //     panelClass: ['error-snackbar'],
                    // });
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
