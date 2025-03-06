import { NgStyle } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, map, Observable, takeUntil } from 'rxjs';
import { IAppState } from '../store/app.state';
import { select, Store } from '@ngrx/store';
import { getUserDetails } from '../store/actions/otp.action';
import { getUserProfileInProcess, getUserProfileSuccess } from '../store/selectors';
import { isEqual } from 'lodash';
import { BaseComponent } from '@proxy/ui/base-component';

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
    // authToken: string = '';

    clientForm = new FormGroup({
        name: new FormControl(''),
        mobile: new FormControl(''),
        email: new FormControl({ value: '', disabled: true }),
    });

    displayedColumns: string[] = ['sno', 'companyName', 'action'];
    constructor(private store: Store<IAppState>) {
        super();
        this.userDetails$ = this.store.pipe(
            select(getUserProfileSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.userInProcess$ = this.store.pipe(
            select(getUserProfileInProcess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.store.dispatch(
            getUserDetails({
                request:
                    'RU41cHVVVlpmOFU3eERFejNFdFJielo3Y25Cd01ucFdHbHNjeFNaR1lINXBobzBaZE1GVGpCb0xlcTNVZFk4cEhmZHdHSmFDdlJBYjNtd1lISWs5WlBQODd1cXovYXNXa05ObGZPc2lpWTJtL2I0c0ovVXYzdXJDNDIxUEJ5NC81MG9YdFdvUGlVMXVJQ3M1aFZqdDB0QlI5M1d5NmJvdlIxSWdXSlZYTU9jPQ==',
            })
        );
        console.log('hej');
    }
}
