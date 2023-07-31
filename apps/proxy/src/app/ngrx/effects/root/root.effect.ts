import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '@proxy/services/proxy/auth';
import * as rootActions from '../../actions/root.action';
import { switchMap } from 'rxjs';

@Injectable()
export class RootEffects {
    constructor(private actions$: Actions, private authService: AuthService) {}

    setAuthToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(rootActions.setAuthToken),
            switchMap((p) => {
                this.authService.setTokenSync(p.token);
                return [];
            })
        )
    );
}
