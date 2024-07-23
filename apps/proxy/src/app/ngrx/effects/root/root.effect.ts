import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as rootActions from '../../actions/root.action';
import { catchError, map, of, switchMap } from 'rxjs';
import { RootService } from '@proxy/services/proxy/root';
import { BaseResponse, IClient, IClientSettings, IPaginatedResponse, errorResolver } from '@proxy/models/root-models';
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

    getAllClients$ = createEffect(() =>
        this.actions$.pipe(
            ofType(rootActions.getAllClients),
            switchMap((req) => {
                return this.rootService.getClients(req.params).pipe(
                    map((res: BaseResponse<IPaginatedResponse<IClient[]>, void>) => {
                        if (res.hasError) {
                            this.showError(res.errors);
                            rootActions.getAllClientsError();
                        }
                        return rootActions.getAllClientsSuccess({ response: res.data });
                    }),
                    catchError((err) => {
                        this.showError(err.errors);
                        return of(rootActions.getAllClientsError());
                    })
                );
            })
        )
    );

    switchClient$ = createEffect(() =>
        this.actions$.pipe(
            ofType(rootActions.switchClient),
            switchMap((req) => {
                return this.rootService.switchClient(req.request).pipe(
                    map((res: BaseResponse<{ message: string }, void>) => {
                        if (res.hasError) {
                            this.showError(res.errors);
                            rootActions.switchClientError();
                        }
                        return rootActions.switchClientSuccess();
                    }),
                    catchError((err) => {
                        this.showError(err.errors);
                        return of(rootActions.switchClientError());
                    })
                );
            })
        )
    );
    getAllProject$ = createEffect(() =>
        this.actions$.pipe(
            ofType(rootActions.getAllProject),
            switchMap((req) => {
                return this.rootService.getProjects().pipe(
                    map((res) => {
                        if (res.hasError) {
                            this.showError(res.errors);
                            rootActions.getAllProjectsError();
                        }
                        return rootActions.getAllProjectSuccess({ response: res.data });
                    }),
                    catchError((err) => {
                        this.showError(err.errors);
                        return of(rootActions.getAllProjectsError);
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
