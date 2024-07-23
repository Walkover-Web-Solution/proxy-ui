import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Observable, filter } from 'rxjs';
import { take } from 'rxjs/operators';
import { rootActions } from '../ngrx/actions';
import { select, Store } from '@ngrx/store';
import { IAppState, selectAllProject } from '../ngrx';

@Injectable({
    providedIn: 'root',
})
export class ProjectGuard implements CanActivate {
    public getProject$: Observable<boolean>;

    constructor(private router: Router, private store: Store<IAppState>) {
        this.getProject$ = this.store.pipe(select(selectAllProject));
    }

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return new Promise<boolean>((promiseResolve) => {
            this.getProject$.pipe(take(1)).subscribe((res) => !res && this.store.dispatch(rootActions.getAllProject()));
            this.getProject$
                .pipe(
                    filter((value) => value != null),
                    take(1)
                )
                .subscribe((res) => {
                    if (!res) {
                        this.router.navigate(['/project']);
                    } else {
                        promiseResolve(true);
                    }
                });
        });
    }
}
