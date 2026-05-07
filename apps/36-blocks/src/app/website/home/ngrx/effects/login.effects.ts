import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, switchMap, take } from 'rxjs/operators';
import { from, of, throwError } from 'rxjs';
import { errorResolver } from '@proxy/models/root-models';
import { AuthService } from '@proxy/services/proxy/auth';
import * as logInActions from '../actions/login.action';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { LoginService } from '@proxy/services/login';
import { UsersService } from '@proxy/services/proxy/users';

@Injectable()
export class LogInEffects {
    private platformId = inject(PLATFORM_ID);

    private usersService = inject(UsersService);

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private loginService: LoginService,
        private afAuth: AngularFireAuth
    ) {}

    emailLogin$ = createEffect(() =>
        this.actions$.pipe(
            ofType(logInActions.emailLoginAction),
            switchMap(({ email, password }) =>
                this.usersService.emailLogin(email, password).pipe(
                    switchMap((response) => {
                        if (response?.hasError) {
                            const message =
                                response?.errors?.message ||
                                response?.data?.message ||
                                response?.message ||
                                'Login failed. Please check your credentials.';
                            return throwError(() => message);
                        }
                        const isOnboardingPending =
                            response?.data?.is_onboarding_pending === true || response?.is_onboarding_pending === true;
                        const jwtToken = response?.data?.token || response?.token || '';
                        if (isOnboardingPending && jwtToken) {
                            return of(logInActions.emailLoginOnboardingPending({ pendingJwtToken: jwtToken }));
                        }
                        if (jwtToken) {
                            this.authService.setTokenSync(jwtToken);
                        }
                        return of(logInActions.emailLoginSuccess());
                    }),
                    catchError((error) => {
                        const resolvedMessage =
                            typeof error === 'string'
                                ? error
                                : error?.errors?.message ||
                                  error?.data?.message ||
                                  error?.message ||
                                  'Login failed. Please check your credentials.';
                        return of(logInActions.logInActionError({ errors: errorResolver(resolvedMessage) }));
                    })
                )
            )
        )
    );

    getUserAction$ = createEffect(() =>
        this.actions$.pipe(
            ofType(logInActions.getUserAction),
            exhaustMap(() => {
                if (!isPlatformBrowser(this.platformId)) {
                    return of(logInActions.NotAuthenticatedAction({ response: null }));
                }
                return this.afAuth.authState.pipe(
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
                );
            })
        )
    );

    // TODO (pending): googleOneTap$ effect activates only when googleClientId is set in env-variables.ts
    // Flow: GIS id_token → Firebase signInWithCredential → logInActionComplete → existing backend chain
    googleOneTap$ = createEffect(() =>
        this.actions$.pipe(
            ofType(logInActions.googleOneTapCredential),
            switchMap(({ idToken }) => {
                const firebaseCredential = GoogleAuthProvider.credential(idToken);
                return from(this.afAuth.signInWithCredential(firebaseCredential)).pipe(
                    map(() => logInActions.logInActionComplete()),
                    catchError((error) => of(logInActions.logInActionError({ errors: errorResolver(error.message) })))
                );
            })
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
                this.authService.clearTokenSync();
                if (isPlatformBrowser(this.platformId)) {
                    window.location.href = '/';
                }
                return this.loginService.logout().pipe(
                    switchMap((action) => {
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
