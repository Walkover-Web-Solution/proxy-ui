import { NgStyle } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, map, Observable, of, takeUntil } from 'rxjs';
import { IAppState } from '../store/app.state';
import { select, Store } from '@ngrx/store';
import { getUserDetails, leaveCompany } from '../store/actions/otp.action';
import {
    getUserProfileData,
    getUserProfileInProcess,
    getUserProfileSuccess,
    leaveCompanyData,
    leaveCompanyDataInProcess,
    leaveCompanySuccess,
    loading,
} from '../store/selectors';
import { BaseComponent } from '@proxy/ui/base-component';
import { isEqual } from 'lodash';
import { MatDialog } from '@angular/material/dialog';
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
    public companyDetails;
    // authToken: string = '';

    clientForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.pattern(UPDATE_REGEX)]),
        mobile: new FormControl({ value: '', disabled: true }),
        email: new FormControl({ value: '', disabled: true }),
    });

    displayedColumns: string[] = ['sno', 'companyName', 'action'];
    constructor(private store: Store<IAppState>, public dialog: MatDialog) {
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
        this.update$ = this.store.pipe(select(loading), distinctUntilChanged(isEqual), takeUntil(this.destroy$));
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
        this.store.dispatch(updateUser({ name: enteredName, authToken: this.authToken }));
        this.update$ = of(true);
        setTimeout(() => {
            this.update$ = of(false);
        }, 2000);

        window.parent.postMessage(
            { eventtype: 'USERNAME_UPDATED', data: { event: 'userNameUpdated', enteredName: enteredName } },
            '*'
        );

        this.previousName = enteredName;
    }
}
