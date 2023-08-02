import { Component, OnInit } from '@angular/core';
import { IFirebaseUserModel } from '@proxy/models/root-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { Store, select } from '@ngrx/store';
import { selectLogInData } from '../auth/ngrx/selector/login.selector';
import { isEqual } from 'lodash';
import { Observable, distinctUntilChanged, takeUntil } from 'rxjs';
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

    constructor(private store: Store<ILogInFeatureStateWithRootState>, private cookieService: CookieService) {
        super();
        this.logInData$ = this.store.pipe(
            select(selectLogInData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.toggleMenuSideBar = this.getIsMobile();
        this.getCurrentTheme();
    }

    public toggleSideBarEvent(event) {
        this.toggleMenuSideBar = !this.toggleMenuSideBar;
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
      

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return false;
        } else {
            return true;
        }
    }
}
