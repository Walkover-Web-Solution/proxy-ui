import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IFirebaseUserModel } from '@proxy/models/root-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { Store, select } from '@ngrx/store';
import { isEqual } from 'lodash';
import { Observable, distinctUntilChanged, takeUntil, debounceTime } from 'rxjs';
import {
    selectLogInErrors,
    selectLogInData,
    selectLogInDataInProcess,
    selectLogInDataSuccess,
} from './ngrx/selector/login.selector';
import { ILogInFeatureStateWithRootState } from './ngrx/store/login.state';
import * as logInActions from './ngrx/actions/login.action';

@Component({
    selector: 'proxy-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
})
export class AuthComponent extends BaseComponent implements OnInit {
    public selectLogInErrors$: Observable<string[]>;
    public logInData$: Observable<IFirebaseUserModel>;
    public logInDataInProcess$: Observable<boolean>;
    public logInDataSuccess$: Observable<boolean>;

    public description = [
        {
            title: 'Feature of SAAR',
            list: [
                'Flexible Proxy Pass',
                'Custom Gateway Domains',
                'Real-time Analytics',
                'Developer-Friendly Documentation',
                'Secure your APIs',
            ],
        },
        { title: 'Why choose SAAR?', list: ['Secure and Reliable', 'Future-Proof Solution', 'User-Centric Design'] },
    ];

    constructor(
        private toast: PrimeNgToastService,
        private _store: Store<ILogInFeatureStateWithRootState>,
        private router: Router
    ) {
        super();

        this.selectLogInErrors$ = this._store.pipe(
            select(selectLogInErrors),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.logInData$ = this._store.pipe(
            select(selectLogInData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.logInDataInProcess$ = this._store.pipe(
            select(selectLogInDataInProcess),
            debounceTime(200),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.logInDataSuccess$ = this._store.pipe(
            select(selectLogInDataSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.selectLogInErrors$.subscribe((res) => {
            res?.forEach((r) => {
                this.toast.error(r);
            });
        });

        this.logInData$.subscribe((res) => {
            if (res) {
                this.router.navigate(['/app']);
            }
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    login() {
        this._store.dispatch(logInActions.logInAction());
    }
}
