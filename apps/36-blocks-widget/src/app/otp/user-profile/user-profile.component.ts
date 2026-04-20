import { CommonModule, NgStyle } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    computed,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
import { WidgetPortalRef, WidgetPortalService } from '../service/widget-portal.service';
import { ToastService } from '../service/toast.service';
import { ToastComponent } from '../service/toast.component';
import { ConfirmDialogComponent } from '../ui/confirm-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, map, Observable, takeUntil, take, filter, skip } from 'rxjs';
import { IAppState } from '../store/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { getUserDetails, leaveCompany, leaveCompanyError, updateUser } from '../store/actions/otp.action';
import {
    error,
    getUserProfileData,
    getUserProfileInProcess,
    updateSuccess,
    leaveCompanySuccess,
} from '../store/selectors';
import { BaseComponent } from '@proxy/ui/base-component';
import { isEqual } from 'lodash-es';
import { NAME_REGEX } from '@proxy/regex';
import { WidgetTheme } from '@proxy/constant';
import { WidgetThemeService } from '../service/widget-theme.service';
@Component({
    selector: 'user-profile',
    imports: [CommonModule, ReactiveFormsModule, ToastComponent, ConfirmDialogComponent],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    public authToken = input<string>();
    public target = input<string>();
    public showCard = input<boolean>();
    public theme = input<string>();
    protected readonly WidgetTheme = WidgetTheme;
    private readonly themeService = inject(WidgetThemeService);
    readonly isDark = computed(() => this.themeService.isDark$());
    @Input()
    set css(type: NgStyle['ngStyle']) {
        this.cssSubject$.next(type);
    }
    private readonly cssSubject$: NgStyle['ngStyle'] = new BehaviorSubject({
        position: 'absolute',
        'margin-left': '50%',
        top: '10px',
    });
    readonly css$ = this.cssSubject$.pipe(
        map((type) =>
            !type || !Object.keys(type).length
                ? {
                      position: 'absolute',
                      'margin-left': '50%',
                      top: '10px',
                  }
                : type
        )
    );
    public successReturn = input<(arg: any) => any>();
    public failureReturn = input<(arg: any) => any>();
    public userDetails$: Observable<any>;
    public userInProcess$: Observable<boolean>;
    public deleteCompany$: Observable<any>;
    public update$: Observable<any>;
    public previousName: string;
    public errorMessage: string;
    public error$: Observable<any>;
    public companyDetails;
    // authToken: string = '';

    clientForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.pattern(NAME_REGEX)]),
        mobile: new FormControl({ value: '', disabled: true }),
        email: new FormControl({ value: '', disabled: true }),
    });

    public readonly isEditing = signal(false);

    private store = inject<Store<IAppState>>(Store);
    private readonly actions$ = inject(Actions);
    readonly toastService = inject(ToastService);
    private readonly widgetPortal = inject(WidgetPortalService);
    private readonly cdr = inject(ChangeDetectorRef);
    readonly confirmDialogCompanyId = signal<number | null>(null);

    @ViewChild('editDialogPortal') private editDialogPortalEl?: ElementRef<HTMLElement>;
    @ViewChild('confirmDialogPortal') private confirmDialogPortalEl?: ElementRef<HTMLElement>;
    @ViewChild('toastPortal') private toastPortalEl?: ElementRef<HTMLElement>;

    private editDialogRef: WidgetPortalRef | null = null;
    private confirmDialogPortalRef: WidgetPortalRef | null = null;
    private toastPortalRef: WidgetPortalRef | null = null;

    constructor() {
        super();
        effect(() => this.themeService.setInputTheme(this.theme()));
        this.userDetails$ = this.store.pipe(
            select(getUserProfileData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.userInProcess$ = this.store.pipe(
            select(getUserProfileInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.deleteCompany$ = this.store.pipe(
            select(leaveCompanySuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.update$ = this.store.pipe(select(updateSuccess), distinctUntilChanged(isEqual), takeUntil(this.destroy$));
        this.error$ = this.store.pipe(select(error), distinctUntilChanged(isEqual), takeUntil(this.destroy$));
    }

    ngAfterViewInit(): void {
        if (this.toastPortalEl?.nativeElement) {
            this.toastPortalRef = this.widgetPortal.attach(this.toastPortalEl.nativeElement);
        }
    }

    ngOnDestroy(): void {
        this.editDialogRef?.detach();
        this.confirmDialogPortalRef?.detach();
        this.toastPortalRef?.detach();
        super.ngOnDestroy();
    }

    ngOnInit(): void {
        this.userDetails$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.previousName = res?.name;
                this.companyDetails = res;
                this.clientForm.get('name').setValue(res?.name);
                this.clientForm.get('email').setValue(res?.email);
                this.clientForm.get('mobile').setValue(res?.mobile ? res.mobile : '--Not Provided--');
            }
        });

        this.clientForm.get('name').valueChanges.subscribe((value) => {
            if (value.trim() !== this.previousName) {
                this.clientForm.get('name').markAsTouched();
            }
        });

        this.store.dispatch(
            getUserDetails({
                request: this.authToken(),
            })
        );
    }

    openModal(companyId: number): void {
        this.confirmDialogCompanyId.set(companyId);
        this.cdr.detectChanges();
        setTimeout(() => {
            if (this.confirmDialogPortalEl?.nativeElement) {
                this.confirmDialogPortalRef = this.widgetPortal.attach(this.confirmDialogPortalEl.nativeElement);
                this.confirmDialogPortalRef.onDetach(() => {
                    this.confirmDialogPortalRef = null;
                    this.confirmDialogCompanyId.set(null);
                });
            }
        });
    }

    confirmLeave(): void {
        const companyId = this.confirmDialogCompanyId();
        this.confirmDialogPortalRef?.detach();
        this.confirmDialogPortalRef = null;
        if (!companyId) return;

        this.actions$
            .pipe(ofType(leaveCompanyError), take(1), takeUntil(this.destroy$))
            .subscribe(({ errorResponse }) => {
                const errorMessage =
                    errorResponse?.error?.errors?.message ||
                    errorResponse?.error?.data?.message ||
                    errorResponse?.error?.message ||
                    errorResponse?.errors?.message ||
                    errorResponse?.data?.message ||
                    errorResponse?.message ||
                    'Failed to leave the organisation.';
                this.toastService.error(errorMessage);
            });

        this.deleteCompany$.pipe(filter(Boolean), take(1)).subscribe((response) => {
            if (response) {
                window.parent.postMessage({ type: 'proxy', data: { event: 'userLeftCompany', companyId } }, '*');
                this.store.dispatch(getUserDetails({ request: this.authToken() }));
            }
        });

        this.store.dispatch(leaveCompany({ companyId, authToken: this.authToken() }));
    }

    public openEditDialog(): void {
        this.isEditing.set(true);
        this.cdr.detectChanges();
        setTimeout(() => {
            if (this.editDialogPortalEl?.nativeElement) {
                this.editDialogRef = this.widgetPortal.attach(this.editDialogPortalEl.nativeElement);
                this.editDialogRef.onDetach(() => {
                    this.editDialogRef = null;
                    this.cancelEdit();
                });
            }
        });
    }

    public cancelEdit() {
        this.editDialogRef?.detach();
        this.editDialogRef = null;
        this.isEditing.set(false);
        this.clientForm.get('name').setValue(this.previousName);
    }

    updateUser() {
        const nameControl = this.clientForm.get('name');
        const enteredName = nameControl?.value?.trim();
        if (enteredName === this.previousName) {
            this.editDialogRef?.detach();
            this.editDialogRef = null;
            this.isEditing.set(false);
            return;
        }

        if (!enteredName || nameControl.invalid) {
            return;
        }

        if (!navigator.onLine) {
            this.errorMessage = 'Something went wrong';
            this.clear();
            return;
        }

        this.update$.pipe(skip(1), filter(Boolean), take(1)).subscribe((res) => {
            if (res) {
                this.editDialogRef?.detach();
                this.editDialogRef = null;
                this.isEditing.set(false);
                this.previousName = enteredName;
                this.cdr.detectChanges();
                this.toastService.success('Information successfully updated');
            }
        });

        this.error$.pipe(skip(1), filter(Boolean), take(1)).subscribe((err) => {
            if (err?.[0]) this.toastService.error(err[0]);
        });

        this.store.dispatch(updateUser({ name: enteredName, authToken: this.authToken() }));

        window.parent.postMessage({ type: 'proxy', data: { event: 'userNameUpdated', enteredName: enteredName } }, '*');
    }

    public clear() {
        this.toastService.error('Something went wrong');
        setTimeout(() => {
            this.errorMessage = '';
        }, 3000);
    }
}
