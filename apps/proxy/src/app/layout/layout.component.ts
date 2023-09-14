import { Component, OnInit } from '@angular/core';
import { IClient, IClientSettings, IFirebaseUserModel, IPaginatedResponse } from '@proxy/models/root-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { Store, select } from '@ngrx/store';
import { selectLogInData } from '../auth/ngrx/selector/login.selector';
import { isEqual } from 'lodash';
import { BehaviorSubject, Observable, distinctUntilChanged, filter, takeUntil } from 'rxjs';
import { ILogInFeatureStateWithRootState } from '../auth/ngrx/store/login.state';
import * as logInActions from '../auth/ngrx/actions/login.action';
import { rootActions } from '../ngrx/actions';
import { CookieService } from 'ngx-cookie-service';
import { selectAllClient, selectClientSettings } from '../ngrx';

@Component({
    selector: 'proxy-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends BaseComponent implements OnInit {
    public logInData$: Observable<IFirebaseUserModel>;
    public clientSettings$: Observable<IClientSettings>;
    public clients$: Observable<IPaginatedResponse<IClient[]>>;

    public isSideNavOpen = new BehaviorSubject<boolean>(true);

    public toggleMenuSideBar: boolean;
    public clientsParams = {
        itemsPerPage: 25,
        pageNo: 1,
    };

    constructor(private store: Store<ILogInFeatureStateWithRootState>, private cookieService: CookieService) {
        super();
        this.logInData$ = this.store.pipe(
            select(selectLogInData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.clientSettings$ = this.store.pipe(
            select(selectClientSettings),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.clients$ = this.store.pipe(
            select(selectAllClient),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.getClients();
        this.getCurrentTheme();
        if (this.isMobileDevice()) {
            this.toggleSideBarEvent();
        }
    }

    public logOut() {
        this.store.dispatch(logInActions.logoutAction());
    }

    public getClients() {
        this.store.dispatch(rootActions.getAllClients({ params: this.clientsParams }));
    }

    public fetchClientsNextPage() {
        if (this.clientsParams.pageNo < this.getValueFromObservable(this.clients$)?.totalPageCount) {
            this.clientsParams = {
                ...this.clientsParams,
                pageNo: this.clientsParams.pageNo + 1,
            };
            this.getClients();
        }
    }

    public switchClient(clientId: number): void {
        this.store.dispatch(rootActions.switchClient({ request: { client_id: clientId } }));
    }

    public getCurrentTheme() {
        if (
            localStorage.getItem('selected-theme') === null ||
            localStorage.getItem('selected-theme') === 'light-theme'
        ) {
            this.switchedDarkMode(false);
        } else {
            this.switchedDarkMode(true);
        }
    }

    switchedDarkMode(isDarkMode: boolean) {
        const hostClass = isDarkMode ? 'dark-theme' : 'light-theme';
        localStorage.setItem('selected-theme', hostClass);
    }

    public isMobileDevice() {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w <= breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    public toggleSideBarEvent(): void {
        this.isSideNavOpen.next(!this.isSideNavOpen.getValue());
    }
}
