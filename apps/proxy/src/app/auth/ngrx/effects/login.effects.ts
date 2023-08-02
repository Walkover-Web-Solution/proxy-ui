import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, switchMap, take } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { errorResolver } from '@proxy/models/root-models';
import { AuthService } from '@proxy/services/proxy/auth';
import * as logInActions from '../actions/login.action';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LoginService } from '@proxy/services/login';

@Injectable()
export class LogInEffects {
    constructor(
        private actions$: Actions,
        private authService: AuthService,
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
                                    return [logInActions.authenticatedAction({ response: data })];
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
                return this.authService.loginViaGoogle().pipe(
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
                return this.authService.getToken().pipe(
                    take(1),
                    switchMap((idToken) => {
                        return this.loginService.googleLogin(idToken).pipe(
                            map((res) => {
                                this.authService.setTokenSync(res.data.auth);
                                return logInActions.getUserAction();
                            }),
                            catchError((err) => {
                                return of(
                                    logInActions.logInActionError({
                                        errors: errorResolver(err?.error?.data?.message || err.message),
                                    })
                                );
                            })
                        );
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
                    switchMap((res: void) => {
                        return [logInActions.logoutActionComplete()];
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
                    switchMap((action) => {
                        this.authService.clearTokenSync();
                        return [];
                    }),
                    catchError((err) => {
                        return of(
                            logInActions.logInActionError({
                                errors: errorResolver(err?.error?.data?.message || err.message),
                            })
                        );
                    })
                );
            })
        )
    );
}
