import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, filter, map, take } from 'rxjs';
import { rootActions } from '../../core/ngrx/actions';
import { IAppState, selectProjectAccessState } from '../../core/ngrx';

@Injectable({ providedIn: 'root' })
export class ProjectGuard {
    constructor(
        private router: Router,
        private store: Store<IAppState>
    ) {}

    canActivate(): Observable<boolean | UrlTree> {
        const access$ = this.store.select(selectProjectAccessState);
        access$.pipe(take(1)).subscribe(({ projects, loading }) => {
            if (!projects && !loading) {
                this.store.dispatch(rootActions.getAllProject());
            }
        });
        return access$.pipe(
            filter(({ projects, loading, failed }) => !loading && (projects !== null || failed)),
            take(1),
            map(({ projects, failed }) => {
                if (failed) return this.router.createUrlTree(['/project-load-error']);
                return projects.data.length > 0 ? true : this.router.createUrlTree(['/project']);
            })
        );
    }
}
