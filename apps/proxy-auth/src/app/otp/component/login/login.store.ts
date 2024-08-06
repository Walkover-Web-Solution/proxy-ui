import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Observable, switchMap } from 'rxjs';
import { OtpService } from '../../service/otp.service';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { HttpErrorResponse } from '@angular/common/http';
import { IlogInData, IOtpData, IResetPassword } from '../../model/otp';
import { errorResolver } from '@proxy/models/root-models';

export interface ILoginInitialState {
    isLoading: boolean;
    logInData: IlogInData;
    resetPassword: IResetPassword;
    otpData: IOtpData;
    apiError;
    showRegistration: boolean;
}

@Injectable()
export class LoginComponentStore extends ComponentStore<ILoginInitialState> {
    constructor(private service: OtpService, private toast: PrimeNgToastService) {
        super({
            isLoading: false,
            logInData: null,
            resetPassword: null,
            otpData: null,
            apiError: false,
            showRegistration: null,
        });
    }
    readonly otpdata$: Observable<any> = this.select((state) => state.otpData);
    readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);
    readonly resetPassword$: Observable<IResetPassword> = this.select((state) => state.resetPassword);
    readonly apiError$: Observable<any> = this.select((state) => state.apiError);
    readonly showRegistration$: Observable<boolean> = this.select((state) => state.showRegistration);

    readonly loginData = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true, apiError: null });
                return this.service.login(req).pipe(
                    tapResponse(
                        (res) => {
                            if (res?.hasError) {
                                return this.patchState({ isLoading: false, apiError: errorResolver(res.errors)?.[0] });
                            }

                            if (res.data.redirect_url) {
                                window.location.href = res.data.redirect_url;
                            }
                            return this.patchState({
                                isLoading: false,
                                logInData: res,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            if (error.status == 403) {
                                this.patchState({ showRegistration: true });
                            }

                            this.patchState({ isLoading: false, apiError: errorResolver(error.error.errors)?.[0] });
                        }
                    )
                );
            })
        );
    });
    readonly resetPassword = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true, apiError: null });
                return this.service.resetPassword(req).pipe(
                    tapResponse(
                        (res) => {
                            if (res?.hasError) {
                                return this.patchState({ isLoading: false, apiError: errorResolver(res.errors)?.[0] });
                            }

                            return this.patchState({
                                isLoading: false,
                                otpData: res.data,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.patchState({ isLoading: false, apiError: errorResolver(error.error.errors)?.[0] });
                        }
                    )
                );
            })
        );
    });
    readonly verfyPasswordOtp = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true, apiError: null });
                return this.service.verfyResetPasswordOtp(req).pipe(
                    tapResponse(
                        (res) => {
                            if (res?.hasError) {
                                return this.patchState({ isLoading: false, apiError: errorResolver(res.errors)?.[0] });
                            }

                            return this.patchState({
                                isLoading: false,
                                resetPassword: res.data,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.patchState({ isLoading: false, apiError: errorResolver(error.error.errors)?.[0] });
                        }
                    )
                );
            })
        );
    });
}
