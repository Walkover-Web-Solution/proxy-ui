import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as rootActions from '../../actions/root.action';
import { switchMap } from 'rxjs';

@Injectable()
export class RootEffects {
    constructor(private actions$: Actions) {}

    getClientSettings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(rootActions.getClientSettings),
            switchMap((p) => {
                return [];
            })
        )
    );
}
