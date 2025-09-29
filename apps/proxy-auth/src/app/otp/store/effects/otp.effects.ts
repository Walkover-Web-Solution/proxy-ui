import { Injectable } from '@angular/core';
import { errorResolver } from '@proxy/models/root-models';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { OtpResModel } from '../../model/otp';
import { OtpService } from '../../service/otp.service';
import { otpActions } from '../actions/index';
import { OtpUtilityService } from '../../service/otp-utility.service';
import { environment } from 'apps/proxy-auth/src/environments/environment';

@Injectable()
export class OtpEffects {
    constructor(
        private actions$: Actions,
        private otpService: OtpService,
        private otpUtilityService: OtpUtilityService
    ) {}

    getWidgetData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.getWidgetData),
            switchMap((p) => {
                return this.otpService.getWidgetData(p.referenceId, p.payload).pipe(
                    map((res: any) => {
                        if (res) {
                            return otpActions.getWidgetDataComplete({
                                response: JSON.parse(
                                    this.otpUtilityService.aesDecrypt(
                                        res?.data?.ciphered ?? '',
                                        environment.apiEncodeKey,
                                        environment.apiIvKey,
                                        true
                                    )
                                ),
                            });
                        }
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.getWidgetDataError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );

    getOtp$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.sendOtpAction),
            switchMap((p) => {
                return this.otpService.sendOtp(p.request).pipe(
                    map((res: OtpResModel) => {
                        if (res.type !== 'error') {
                            return otpActions.sendOtpActionComplete({
                                response: res,
                            });
                        }
                        return otpActions.sendOtpActionError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.sendOtpActionError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );

    resendOtp$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.getOtpResendAction),
            switchMap((p) => {
                return this.otpService.resendOtpService(p.request).pipe(
                    map((res: OtpResModel) => {
                        if (res.type === 'success') {
                            return otpActions.getOtpResendActionComplete({
                                response: res,
                            });
                        }
                        return otpActions.getOtpResendActionError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.getOtpResendActionError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );

    verifyOtp$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.getOtpVerifyAction),
            switchMap((p) => {
                return this.otpService.verifyOtpService(p.request).pipe(
                    map((res: OtpResModel) => {
                        if (res.type === 'success') {
                            return otpActions.getOtpVerifyActionComplete({
                                response: res,
                            });
                        }
                        return otpActions.getOtpVerifyActionError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.getOtpVerifyActionError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );
    getUserDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.getUserDetails),
            switchMap((p) => {
                return this.otpService.getUserDetailsData(p.request).pipe(
                    map((res: any) => {
                        if (res.type !== 'error') {
                            return otpActions.getUserDetailsComplete({
                                response: res?.data[0],
                            });
                        }
                        return otpActions.getUserDetailsError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.getUserDetailsError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );
    leaveCompany$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.leaveCompany),
            switchMap(({ companyId, authToken }) => {
                return this.otpService.leaveCompanyUser(companyId, authToken).pipe(
                    map((res: any) => {
                        if (res.type !== 'error') {
                            return otpActions.leaveCompanyComplete({
                                response: res?.data[0],
                            });
                        }
                        return otpActions.leaveCompanyError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.leaveCompanyError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );

    UpdateUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.updateUser),
            switchMap(({ name, authToken }) => {
                return this.otpService.updateUser(name, authToken).pipe(
                    map((res: any) => {
                        if (res.type !== 'error') {
                            return otpActions.updateUserComplete({
                                response: res,
                            });
                        }
                        return otpActions.updateUserError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.updateUserError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );
    addUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.addUser),
            switchMap(({ payload, authToken }) => {
                return this.otpService.addUser(payload, authToken).pipe(
                    map((res: any) => {
                        if (res.status === 'success') {
                            return otpActions.addUserComplete({
                                response: res,
                            });
                        }
                        return otpActions.addUserError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.addUserError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );
    getRoles$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.getRoles),
            switchMap(({ authToken }) => {
                return this.otpService.getRoles(authToken).pipe(
                    map((res: any) => {
                        if (res.status === 'success') {
                            return otpActions.getRolesComplete({
                                response: res,
                            });
                        }
                        return otpActions.getRolesError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.getRolesError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );

    createRole$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.createRole),
            switchMap(({ name, permissions, authToken }) => {
                return this.otpService.createRole(name, permissions, authToken).pipe(
                    map((res: any) => {
                        if (res.status === 'success') {
                            return otpActions.createRoleComplete({
                                response: res,
                            });
                        }
                        return otpActions.createRoleError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.createRoleError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );

    getCompanyUsers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.getCompanyUsers),
            switchMap(({ authToken }) => {
                return this.otpService.getCompanyUsers(authToken).pipe(
                    map((res: any) => {
                        if (res.status === 'success') {
                            return otpActions.getCompanyUsersComplete({
                                response: res,
                            });
                        }
                        return otpActions.getCompanyUsersError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.getCompanyUsersError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );

    createPermission$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.createPermission),
            switchMap(({ name, authToken }) => {
                return this.otpService.createPermission(name, authToken).pipe(
                    map((res: any) => {
                        if (res.status === 'success') {
                            return otpActions.createPermissionComplete({
                                response: res,
                            });
                        }
                        return otpActions.createPermissionError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.createPermissionError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );
    getPermissions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.getPermissions),
            switchMap(({ authToken }) => {
                return this.otpService.getPermissions(authToken).pipe(
                    map((res: any) => {
                        if (res.status === 'success') {
                            return otpActions.getPermissionsComplete({
                                response: res,
                            });
                        }
                        return otpActions.getPermissionsError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.getPermissionsError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );

    updateCompanyUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.updateCompanyUser),
            switchMap(({ payload, authToken }) => {
                return this.otpService.updateCompanyUser(payload, authToken).pipe(
                    map((res: any) => {
                        if (res.status === 'success') {
                            return otpActions.updateCompanyUserComplete({
                                response: res,
                            });
                        }
                        return otpActions.updateCompanyUserError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.updateCompanyUserError({
                                errors: errorResolver(err.errors),
                                errorResponse: err,
                            })
                        );
                    })
                );
            })
        )
    );
}
