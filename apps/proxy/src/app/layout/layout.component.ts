import { Component, OnInit } from '@angular/core';
import { IFirebaseUserModel } from '@proxy/models/root-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { Store, select } from '@ngrx/store';
import { selectLogInData } from '../auth/ngrx/selector/login.selector';
import { isEqual } from 'lodash';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ILogInFeatureStateWithRootState } from '../auth/ngrx/store/login.state';
import * as logInActions from '../auth/ngrx/actions/login.action';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'proxy-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends BaseComponent implements OnInit {
    public toggleMenuSideBar: boolean;
    public logInData$: Observable<IFirebaseUserModel>;
    public sideNavOpenState = true;
    public isSideNavOpen$ = new BehaviorSubject<boolean>(this.sideNavOpenState);

    constructor(private store: Store<ILogInFeatureStateWithRootState>, private cookieService: CookieService) {
        super();
        this.logInData$ = this.store.pipe(
            select(selectLogInData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.getCurrentTheme();
        if (this.isMobileDevice()) {
            this.toggleSideBarEvent();
        }
    }

    public logOut() {
        this.store.dispatch(logInActions.logoutAction());
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
        this.isSideNavOpen$.next((this.sideNavOpenState = !this.sideNavOpenState));
    }
}
