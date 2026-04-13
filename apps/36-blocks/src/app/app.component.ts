import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrimeNgToastComponent } from '@proxy/ui/prime-ng-toast';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { VersionCheckService } from '@proxy/service';
import { UiSettingsService } from './panel/layout/ui-settings.service';
import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { BaseComponent } from '@proxy/ui/base-component';
import { selectLogInData, selectLogOutSuccess } from './website/home/ngrx/selector/login.selector';
import { ILogInFeatureStateWithRootState } from './website/home/ngrx/store/login.state';
import { IAppState, selectClientSettings } from './core/ngrx';
import { rootActions } from './core/ngrx/actions';
import * as logInActions from './website/home/ngrx/actions/login.action';
import { IClientSettings, IFirebaseUserModel } from '@proxy/models/root-models';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-root',
    imports: [RouterModule, PrimeNgToastComponent],
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

    private _store = inject<Store<ILogInFeatureStateWithRootState>>(Store);
    private router = inject(Router);
    private actRoute = inject(ActivatedRoute);
    private store = inject<Store<IAppState>>(Store);
    private versionCheckService = inject(VersionCheckService);
    private uiSettings = inject(UiSettingsService);
    private platformId = inject(PLATFORM_ID);

    constructor() {
        super();

        if (isPlatformBrowser(this.platformId)) {
            this._store.dispatch(logInActions.getUserAction());
        }
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
                if (this.newVersionAvailableForWebApp && isPlatformBrowser(this.platformId)) {
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
        this.uiSettings.setTheme(this.uiSettings.theme);

        this.logoutActionComplete$.subscribe((res) => {
            if (res) {
                this.router.navigate(['']);
            }
        });

        if (environment.env !== 'local' && isPlatformBrowser(this.platformId)) {
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
