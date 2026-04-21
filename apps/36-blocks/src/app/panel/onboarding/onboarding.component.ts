import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    ViewChild,
    inject,
    OnDestroy,
    OnInit,
    signal,
} from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AuthService } from '@proxy/services/proxy/auth';
import { UsersService } from '@proxy/services/proxy/users';
import { COUNTRIES_DATA, Country } from '../../../../../shared/assets/utils/countries-info';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-onboarding',
    imports: [ReactiveFormsModule, ScrollingModule],
    templateUrl: './onboarding.component.html',
    styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent implements OnInit, OnDestroy {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly usersService = inject(UsersService);
    private readonly destroy$ = new Subject<void>();

    public readonly onboardingSubmitting = signal<boolean>(false);
    public readonly onboardingError = signal<string | null>(null);
    public passwordVisible = false;

    private pendingJwtToken: string | null = null;

    public readonly allCountries: Country[] = COUNTRIES_DATA;
    public selectedCountry: Country = COUNTRIES_DATA.find((country) => country.code === 'IN') ?? COUNTRIES_DATA[0];
    public readonly dialCodeDropdownOpen = signal<boolean>(false);
    public readonly dialCodeSearchQuery = signal<string>('');

    @ViewChild('dialCodeDropdownRef') private readonly dialCodeDropdownRef!: ElementRef<HTMLElement>;

    public get filteredCountries(): Country[] {
        const query = this.dialCodeSearchQuery().trim().toLowerCase();
        if (!query) {
            return this.allCountries;
        }
        return this.allCountries.filter(
            (country) =>
                country.name.toLowerCase().includes(query) ||
                country.dialCode.includes(query) ||
                country.nativeName.toLowerCase().includes(query)
        );
    }

    public toggleDialCodeDropdown(): void {
        const isOpen = !this.dialCodeDropdownOpen();
        this.dialCodeDropdownOpen.set(isOpen);
        if (isOpen) {
            this.dialCodeSearchQuery.set('');
        }
    }

    public selectCountry(country: Country): void {
        this.selectedCountry = country;
        this.dialCodeDropdownOpen.set(false);
        this.dialCodeSearchQuery.set('');
    }

    public updateDialCodeSearch(value: string): void {
        this.dialCodeSearchQuery.set(value);
    }

    public trackCountryByCode(_index: number, country: Country): string {
        return country.code;
    }

    @HostListener('document:keydown.escape')
    public closeDialCodeDropdownOnEscape(): void {
        this.dialCodeDropdownOpen.set(false);
    }

    @HostListener('document:click', ['$event'])
    public closeDialCodeDropdownOnOutsideClick(event: MouseEvent): void {
        if (this.dialCodeDropdownRef && !this.dialCodeDropdownRef.nativeElement.contains(event.target as Node)) {
            this.dialCodeDropdownOpen.set(false);
        }
    }

    public readonly onboardingFormGroup = new FormGroup({
        name: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(2)],
        }),
        mobile: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/^\d{10,15}$/)],
        }),
        organizationName: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(2)],
        }),
    });

    public ngOnInit(): void {
        this.pendingJwtToken = this.activatedRoute.snapshot.queryParamMap.get('token');
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public getFieldError(fieldName: string): string | null {
        const control = this.onboardingFormGroup.get(fieldName);
        if (!control || !control.invalid || !control.touched) {
            return null;
        }
        if (control.errors?.['required']) {
            return 'This field is required.';
        }
        if (control.errors?.['minlength']) {
            const requiredLength = control.errors['minlength'].requiredLength;
            return `Must be at least ${requiredLength} characters.`;
        }
        if (control.errors?.['pattern'] && fieldName === 'mobile') {
            return 'Please enter a valid mobile number (10\u201315 digits).';
        }
        return 'Invalid value.';
    }

    public submitOnboarding(): void {
        if (this.onboardingFormGroup.invalid) {
            this.onboardingFormGroup.markAllAsTouched();
            return;
        }
        this.onboardingError.set(null);
        this.onboardingSubmitting.set(true);
        const formValue = this.onboardingFormGroup.getRawValue();
        const dialCodeDigitsOnly = this.selectedCountry.dialCode.replace(/^\+/, '');
        const mobileWithDialCode = `${dialCodeDigitsOnly}${formValue.mobile}`;

        this.usersService
            .submitOnboarding({
                user: {
                    name: formValue.name,
                    mobile: mobileWithDialCode,
                },
                client: {
                    name: formValue.organizationName,
                    mobile: mobileWithDialCode,
                },
                onboarding_token: this.pendingJwtToken ?? undefined,
            })
            .pipe(take(1), takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const jwtToken = response?.data?.token || response?.token;
                    if (jwtToken) {
                        this.authService.setTokenSync(jwtToken);
                    }
                    this.onboardingSubmitting.set(false);
                    this.router.navigate(['/app/features/create']);
                },
                error: (error) => {
                    const errorBody = error?.error;
                    const resolvedMessage =
                        errorBody?.errors?.message ||
                        errorBody?.data?.message ||
                        errorBody?.message ||
                        'Onboarding failed. Please try again.';
                    this.onboardingError.set(resolvedMessage);
                    this.onboardingSubmitting.set(false);
                },
            });
    }
}
