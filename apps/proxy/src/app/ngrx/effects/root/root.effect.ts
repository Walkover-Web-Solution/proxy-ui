import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as rootActions from '../../actions/root.action';
import { catchError, map, of, switchMap } from 'rxjs';
import { RootService } from '@proxy/services/proxy/root';
import { BaseResponse, IClientSettings, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';

@Injectable()
export class RootEffects {
    constructor(private actions$: Actions, private toast: PrimeNgToastService, private rootService: RootService) {}

    getClientSettings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(rootActions.getClientSettings),
            switchMap((req) => {
                return this.rootService.getClientSettings().pipe(
                    map((res: BaseResponse<IClientSettings, void>) => {
                        if (res.hasError) {
                            this.showError(res.errors);
                            rootActions.getClientSettingsError();
                        }
                        return rootActions.getClientSettingsSuccess({ response: res.data });
                    }),
                    catchError((err) => {
                        this.showError(err.errors);
                        return of(rootActions.getClientSettingsError());
                    })
                );
            })
        )
    );

    private showError(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
