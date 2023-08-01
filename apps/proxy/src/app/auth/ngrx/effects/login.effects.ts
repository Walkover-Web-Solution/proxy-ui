import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, switchMap, take } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { errorResolver } from '@msg91/models/root-models';
import { AuthService } from '@proxy/services/proxy/auth';
import * as logInActions from '../actions/login.action';
import * as rootActions from '../../../ngrx/actions';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LoginService } from '@proxy/services/login';

@Injectable()
export class LogInEffects {
    constructor(
        private actions$: Actions,
        private service: AuthService,
        private loginService: LoginService,
        private afAuth: AngularFireAuth
    ) {}

    getUserAction$ = createEffect(() =>
        this.actions$.pipe(
            ofType(logInActions.getUserAction),
            exhaustMap(() =>
                this.afAuth.authState.pipe(
                    take(1),
                    switchMap((user) => {
                        if (user) {
                            return from(user.getIdToken()).pipe(
                                take(1),
                                switchMap((token) => {
                                    const data = {
                                        uid: user.uid,
                                        displayName: user.displayName,
                                        email: user.email,
                                        phoneNumber: user.phoneNumber,
                                        photoURL: user.photoURL,
                                        emailVerified: user.emailVerified,
                                        jwtToken: token,
                                    };
                                    return [
                                        rootActions.rootActions.setAuthToken({ token }),
                                        logInActions.authenticatedAction({ response: data }),
                                    ];
                                }),
                                catchError((err) => {
                                    return of(logInActions.logInActionError({ errors: errorResolver(err.message) }));
                                })
                            );
                        } else {
                            return [logInActions.NotAuthenticatedAction({ response: null })];
                        }
                    })
                )
            )
        )
    );

    googleLogin$ = createEffect(() =>
        this.actions$.pipe(
            ofType(logInActions.logInAction),
            switchMap(() => {
                return this.service.loginViaGoogle().pipe(
                    map((res) => {
                        return logInActions.logInActionComplete();
                    }),
                    catchError((err) => {
                        return of(logInActions.logInActionError({ errors: errorResolver(err.message) }));
                    })
                );
            })
        )
    );

    authenticatedAction$ = createEffect(() =>
        this.actions$.pipe(
            ofType(logInActions.logInActionComplete),
            switchMap((p) => {
                return this.loginService.googleLogin({}).pipe(
                    map((res) => {
                        return logInActions.getUserAction();
                    }),
                    catchError((err) => {
                        return of(logInActions.logInActionError({ errors: errorResolver(err.message) }));
                    })
                );
            })
        )
    );

    logout$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(logInActions.logoutAction),
            switchMap((p) => {
                return from(this.afAuth.signOut()).pipe(
                    map((res: void) => {
                        return logInActions.logoutActionComplete();
                    }),
                    catchError((err) => {
                        return of(logInActions.logoutActionError({ errors: errorResolver(err.errors) }));
                    })
                );
            })
        );
    });

    logoutActionComplete$ = createEffect(() =>
        this.actions$.pipe(
            ofType(logInActions.logoutActionComplete),
            switchMap((p) => {
                return this.loginService.logout().pipe(
                    catchError((err) => {
                        return of(logInActions.logInActionError({ errors: errorResolver(err.message) }));
                    })
                );
                return [];
            })
        )
    );
}
