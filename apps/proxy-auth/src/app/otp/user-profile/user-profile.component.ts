import { NgStyle } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, map, Observable, of, takeUntil, take } from 'rxjs';
import { IAppState } from '../store/app.state';
import { select, Store } from '@ngrx/store';
import { getUserDetails, leaveCompany } from '../store/actions/otp.action';
import {
    error,
    getUserProfileData,
    getUserProfileInProcess,
    updateSuccess,
    getUserProfileSuccess,
    leaveCompanyData,
    leaveCompanyDataInProcess,
    leaveCompanySuccess,
    loading,
} from '../store/selectors';
import { BaseComponent } from '@proxy/ui/base-component';
import { isEqual } from 'lodash';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from './user-dialog/user-dialog.component';
import { updateUser } from '../store/actions/otp.action';
import { UPDATE_REGEX } from '@proxy/regex';
@Component({
    selector: 'proxy-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent extends BaseComponent implements OnInit {
    @Input() public authToken: string;
    @Input() public target: string;
    @Input() public showCard: boolean;
    @Input() public theme: string;
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
    @Input() public successReturn: (arg: any) => any;
    @Input() public failureReturn: (arg: any) => any;
    @Input() public otherData: { [key: string]: any } = {};
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

    displayedColumns: string[] = ['companyName', 'action'];
    constructor(
        private store: Store<IAppState>,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private overlay: Overlay
    ) {
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
                request: this.authToken,
            })
        );
    }

    openModal(companyId: number): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: { companyId: companyId, authToken: this.authToken },
            // Prevent CDK BlockScrollStrategy from applying left/top on <html> when dialog opens
            scrollStrategy: this.overlay.scrollStrategies.noop(),
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.store.dispatch(
                    getUserDetails({
                        request: this.authToken,
                    })
                );
            }
        });
    }

    updateUser() {
        const nameControl = this.clientForm.get('name');
        const enteredName = nameControl?.value?.trim();

        if (!enteredName || enteredName === this.previousName || nameControl.invalid) {
            return;
        }

        if (!navigator.onLine) {
            this.errorMessage = 'Something went wrong';
            this.clear();
            return;
        }

        this.store.dispatch(updateUser({ name: enteredName, authToken: this.authToken }));

        this.update$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.snackBar.open('Information successfully updated', '✕', {
                    duration: 10000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['success-snackbar'],
                });
            }
        });

        this.error$.pipe(take(1)).subscribe((err) => {
            if (err) {
                this.snackBar.open('Something went wrong', '✕', {
                    duration: 10000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['error-snackbar'],
                });
            }
        });

        window.parent.postMessage({ type: 'proxy', data: { event: 'userNameUpdated', enteredName: enteredName } }, '*');
        this.previousName = enteredName;
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
