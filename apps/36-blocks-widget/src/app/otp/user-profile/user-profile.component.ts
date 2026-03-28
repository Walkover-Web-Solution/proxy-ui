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
import { BehaviorSubject, distinctUntilChanged, map, Observable, takeUntil, take, filter } from 'rxjs';
import { IAppState } from '../store/app.state';
import { select, Store } from '@ngrx/store';
import { getUserDetails, leaveCompany, updateUser } from '../store/actions/otp.action';
import {
    error,
    getUserProfileData,
    getUserProfileInProcess,
    updateSuccess,
    leaveCompanySuccess,
} from '../store/selectors';
import { BaseComponent } from '@proxy/ui/base-component';
import { isEqual } from 'lodash-es';
import { UPDATE_REGEX } from '@proxy/regex';
import { WidgetTheme } from '@proxy/constant';
import { WidgetThemeService } from '../service/widget-theme.service';
@Component({
    selector: 'user-profile',
    imports: [CommonModule, ReactiveFormsModule, ToastComponent, ConfirmDialogComponent],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    public authToken = input<string>();
    public target = input<string>();
    public showCard = input<boolean>();
    public theme = input<string>();
    protected readonly WidgetTheme = WidgetTheme;
    private readonly themeService = inject(WidgetThemeService);
    get isDark(): boolean {
        return this.themeService.isDark(this.theme() as WidgetTheme);
    }
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
    public otherData = input<{ [key: string]: any }>({});
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
        name: new FormControl('', [Validators.required, Validators.pattern(UPDATE_REGEX)]),
        mobile: new FormControl({ value: '', disabled: true }),
        email: new FormControl({ value: '', disabled: true }),
    });

    public isEditing = false;

    private store = inject<Store<IAppState>>(Store);
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
        if (this.confirmDialogPortalEl?.nativeElement) {
            this.confirmDialogPortalRef = this.widgetPortal.attach(this.confirmDialogPortalEl.nativeElement);
        }
    }

    confirmLeave(): void {
        this.confirmDialogPortalRef?.detach();
        this.confirmDialogPortalRef = null;
        const companyId = this.confirmDialogCompanyId();
        this.confirmDialogCompanyId.set(null);
        if (!companyId) return;
        this.store.dispatch(leaveCompany({ companyId, authToken: this.authToken() }));
        this.deleteCompany$.pipe(filter(Boolean), take(1)).subscribe((res) => {
            if (res) {
                window.parent.postMessage({ type: 'proxy', data: { event: 'userLeftCompany', companyId } }, '*');
                this.store.dispatch(getUserDetails({ request: this.authToken() }));
            }
        });
    }

    public openEditDialog(): void {
        this.isEditing = true;
        this.cdr.detectChanges();
        if (this.editDialogPortalEl?.nativeElement) {
            this.editDialogRef = this.widgetPortal.attach(this.editDialogPortalEl.nativeElement);
        }
    }

    public cancelEdit() {
        this.editDialogRef?.detach();
        this.editDialogRef = null;
        this.isEditing = false;
        this.clientForm.get('name').setValue(this.previousName);
    }

    updateUser() {
        const nameControl = this.clientForm.get('name');
        const enteredName = nameControl?.value?.trim();
        if (enteredName === this.previousName) {
            this.editDialogRef?.detach();
            this.editDialogRef = null;
            this.isEditing = false;
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

        this.store.dispatch(updateUser({ name: enteredName, authToken: this.authToken() }));

        this.update$.pipe(filter(Boolean), take(1)).subscribe((res) => {
            if (res) {
                this.editDialogRef?.detach();
                this.editDialogRef = null;
                this.isEditing = false;
                this.previousName = enteredName;
                this.toastService.success('Information successfully updated');
            }
        });

        this.error$.pipe(filter(Boolean), take(1)).subscribe((err) => {
            if (err?.[0]) this.toastService.error(err[0]);
        });

        window.parent.postMessage({ type: 'proxy', data: { event: 'userNameUpdated', enteredName: enteredName } }, '*');
    }

    public clear() {
        this.toastService.error('Something went wrong');
        setTimeout(() => {
            this.errorMessage = '';
        }, 3000);
    }
}
