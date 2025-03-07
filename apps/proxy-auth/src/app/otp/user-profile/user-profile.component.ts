import { NgStyle } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, map, Observable, takeUntil } from 'rxjs';
import { IAppState } from '../store/app.state';
import { select, Store } from '@ngrx/store';
import { getUserDetails } from '../store/actions/otp.action';
import {
    getUserProfileData,
    getUserProfileInProcess,
    getUserProfileSuccess,
    leaveCompanyData,
} from '../store/selectors';
import { BaseComponent } from '@proxy/ui/base-component';
import { isEqual } from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './user-dialog/user-dialog.component';
@Component({
    selector: 'proxy-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent extends BaseComponent implements OnInit {
    @Input() public authToken: string;
    @Input() public target: string;
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
    public deleteCompany$: Observable<boolean>;
    public companyDetails;
    // authToken: string = '';

    clientForm = new FormGroup({
        name: new FormControl(''),
        mobile: new FormControl(''),
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
            select(leaveCompanyData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.userDetails$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.companyDetails = res;
                this.clientForm.get('name').setValue(res?.name);
                this.clientForm.get('email').setValue(res?.email);
                this.clientForm.get('mobile').setValue(res?.mobile);
            }
        });
        this.store.dispatch(
            getUserDetails({
                request: this.authToken,
            })
        );
    }

    openModal(companyId: string): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: { companyId },
        });

        dialogRef.afterClosed().subscribe((result) => {
            // if (result === 'confirmed') {
            // }
        });
    }
}
