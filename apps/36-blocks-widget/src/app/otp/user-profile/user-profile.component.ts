import { CommonModule, NgStyle } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation, inject, input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, map, Observable, takeUntil, take, filter } from 'rxjs';
import { IAppState } from '../store/app.state';
import { select, Store } from '@ngrx/store';
import { getUserDetails } from '../store/actions/otp.action';
import {
    error,
    getUserProfileData,
    getUserProfileInProcess,
    updateSuccess,
    leaveCompanySuccess,
} from '../store/selectors';
import { BaseComponent } from '@proxy/ui/base-component';
import { isEqual } from 'lodash-es';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from './user-dialog/user-dialog.component';
import { updateUser } from '../store/actions/otp.action';
import { UPDATE_REGEX } from '@proxy/regex';
import { PublicScriptTheme } from '@proxy/constant';
@Component({
    selector: 'user-profile',
    imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, MatDialogModule],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent extends BaseComponent implements OnInit {
    public authToken = input<string>();
    public target = input<string>();
    public showCard = input<boolean>();
    public theme = input<string>();
    protected readonly PublicScriptTheme = PublicScriptTheme;
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
    public dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private overlay = inject(Overlay);

    constructor() {
        super();
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
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: { companyId: companyId, authToken: this.authToken(), theme: this.theme() },
            panelClass: this.theme() === PublicScriptTheme.Dark ? 'confirm-dialog-dark' : 'confirm-dialog-light',
            // Prevent CDK BlockScrollStrategy from applying left/top on <html> when dialog opens
            scrollStrategy: this.overlay.scrollStrategies.noop(),
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.store.dispatch(
                    getUserDetails({
                        request: this.authToken(),
                    })
                );
            }
        });
    }

    public cancelEdit() {
        this.isEditing = false;
        this.clientForm.get('name').setValue(this.previousName);
    }

    updateUser() {
        const nameControl = this.clientForm.get('name');
        const enteredName = nameControl?.value?.trim();
        if (enteredName === this.previousName) {
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
                this.isEditing = false;
                this.previousName = enteredName;
                this.snackBar.open('Information successfully updated', '✕', {
                    duration: 10000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['success-snackbar'],
                });
            }
        });

        this.error$.pipe(filter(Boolean), take(1)).subscribe((err) => {
            if (err) {
                this.snackBar.open(err[0], '✕', {
                    duration: 10000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['error-snackbar'],
                });
            }
        });

        window.parent.postMessage({ type: 'proxy', data: { event: 'userNameUpdated', enteredName: enteredName } }, '*');
    }

    public clear() {
        this.snackBar.open('Something went wrong', '✕', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
        });
        setTimeout(() => {
            this.errorMessage = '';
        }, 3000);
    }
}
