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

    getSubscriptionPlans$ = createEffect(() =>
        this.actions$.pipe(
            ofType(otpActions.getSubscriptionPlans),
            switchMap(({ referenceId }) => {
                return this.otpService.getSubscriptionPlans(referenceId).pipe(
                    map((res: any) => {
                        if (res.status === 'success') {
                            return otpActions.getSubscriptionPlansComplete({
                                response: res,
                            });
                        }
                        return otpActions.getSubscriptionPlansError({
                            errors: errorResolver(res.message),
                            errorResponse: res,
                        });
                    }),
                    catchError((err) => {
                        return of(
                            otpActions.getSubscriptionPlansError({
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
