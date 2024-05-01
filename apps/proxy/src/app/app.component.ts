import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { VersionCheckService } from '@proxy/service';
import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { selectLogInData, selectLogOutSuccess } from './auth/ngrx/selector/login.selector';
import { ILogInFeatureStateWithRootState } from './auth/ngrx/store/login.state';
import { IAppState, selectClientSettings } from './ngrx';
import { rootActions } from './ngrx/actions';
import * as logInActions from './auth/ngrx/actions/login.action';
import { generateJwtToken } from '@proxy/utils';
import { IClientSettings, IFirebaseUserModel } from '@proxy/models/root-models';
import { AuthService } from '@proxy/services/proxy/auth';

@Component({
    selector: 'proxy-root',
    templateUrl: './app.component.html',
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
    public title = 'proxy';
    public logoutActionComplete$: Observable<boolean>;
    public companyId$: Observable<string>;
    public logInData$: Observable<IFirebaseUserModel>;
    public clientSettings$: Observable<IClientSettings>;

    /** True, if new build is deployed */
    private newVersionAvailableForWebApp: boolean = false;

    constructor(
        private _store: Store<ILogInFeatureStateWithRootState>,
        private router: Router,
        private actRoute: ActivatedRoute,
        private store: Store<IAppState>,
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
        this.logInData$ = this._store.pipe(
            select(selectLogInData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.clientSettings$ = this.store.pipe(
            select(selectClientSettings),
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

        if (environment.env !== 'local') {
            this.versionCheckService.initVersionCheck(environment.proxyServer + '/version.json');

            this.versionCheckService.onVersionChange$.pipe(takeUntil(this.destroy$)).subscribe((isChanged: boolean) => {
                if (isChanged) {
                    this.newVersionAvailableForWebApp = isChanged;
                }
            });
        }
        combineLatest([this.logInData$, this.clientSettings$]).subscribe(([loginData, clientSettings]) => {
            if (loginData && clientSettings) {
                const scriptId = 'interface-main-script';
                if (document.getElementById(scriptId)) {
                    document.getElementById(scriptId)?.remove();
                }
                const scriptElement = document.createElement('script');
                scriptElement.type = 'text/javascript';
                scriptElement.src = environment.interfaceScriptUrl;
                scriptElement.id = scriptId;
                scriptElement.setAttribute(
                    'embedToken',
                    generateJwtToken(
                        {
                            org_id: +environment.interfaceOrgId,
                            project_id: environment.interfaceProjectId,
                            interface_id: environment.interfaceId,
                            user_id: loginData?.email,
                        },
                        environment.interfaceSecret
                    )
                );
                scriptElement.onload = () => {
                    const payload = {
                        variables: {
                            variables: JSON.stringify({
                                session: this.authService.getTokenSync(),
                                project_id: environment.interfaceProjectId,
                            }),
                        },
                        threadId: `${loginData?.email}${clientSettings?.client?.id}`,
                        bridgeName: 'root',
                    };
                    console.log('SendDataToInterface ==>', payload);
                    (window as any).SendDataToInterface(payload);
                };
                document.body.appendChild(scriptElement);
            }
        });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
