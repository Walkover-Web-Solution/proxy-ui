import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import { VersionCheckService } from '@msg91/service';
import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { BaseComponent } from '@msg91/ui/base-component';
import { selectLogOutSuccess } from './auth/ngrx/selector/login.selector';
import { ILogInFeatureStateWithRootState } from './auth/ngrx/store/login.state';
import { IAppState, selectAccessToken } from './ngrx';
import { rootActions } from './ngrx/actions';
import * as logInActions from './auth/ngrx/actions/login.action';
import { AuthService } from '@proxy/services/proxy/auth';

@Component({
    selector: 'proxy-root',
    templateUrl: './app.component.html',
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
    public title = 'proxy';
    public logoutActionComplete$: Observable<boolean>;
    public selectAccessToken$: Observable<string>;
    public companyId$: Observable<string>;

    /** True, if new build is deployed */
    private newVersionAvailableForWebApp: boolean = false;

    constructor(
        private _store: Store<ILogInFeatureStateWithRootState>,
        private router: Router,
        private actRoute: ActivatedRoute,
        private store: Store<IAppState>,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private versionCheckService: VersionCheckService,
        private authService: AuthService
    ) {
        super();

        this._store.dispatch(logInActions.getUserAction());
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                map(() => this.actRoute),
                map((route) => {
                    while (route.firstChild) route = route.firstChild;
                    return route;
                }),
                filter((route) => route.outlet === 'primary'),
                mergeMap((route) => route.data),
                distinctUntilChanged(isEqual),
                takeUntil(this.destroy$)
            )
            .subscribe((event) => {
                this.store.dispatch(rootActions.headerTitleAction({ title: event['title'] }));
            });
        this.router.events
            .pipe(
                filter((event: any) => event instanceof NavigationStart),
                takeUntil(this.destroy$)
            )
            .subscribe((res) => {
                if (this.newVersionAvailableForWebApp) {
                    window.location.reload();
                }
            });
        this.logoutActionComplete$ = this._store.pipe(
            select(selectLogOutSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.selectAccessToken$ = this._store.pipe(
            select(selectAccessToken),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    public ngOnInit(): void {
        this.logoutActionComplete$.subscribe((res) => {
            if (res) {
                this.router.navigate(['/login']);
            }
        });

        this.selectAccessToken$.subscribe((token) => {
            if (!token) return;
            this.token.token = token;
            this.authService.fetchActiveToken();
        });

        if (environment.env !== 'local') {
            this.versionCheckService.initVersionCheck(environment.proxyServer + '/version.json');

            this.versionCheckService.onVersionChange$.pipe(takeUntil(this.destroy$)).subscribe((isChanged: boolean) => {
                if (isChanged) {
                    this.newVersionAvailableForWebApp = isChanged;
                }
            });
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
