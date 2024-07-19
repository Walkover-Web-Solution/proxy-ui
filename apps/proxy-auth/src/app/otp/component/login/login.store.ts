import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Observable, switchMap } from 'rxjs';
import { OtpService } from '../../service/otp.service';
import { errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { HttpErrorResponse } from '@angular/common/http';
import { IlogInData, IOtpData, IResetPassword } from '../../model/otp';

export interface ILoginInitialState {
    isLoading: boolean;
    logInData: IlogInData;
    resetPassword: IResetPassword;
    otpData: IOtpData;
}

@Injectable()
export class LoginComponentStore extends ComponentStore<ILoginInitialState> {
    constructor(private service: OtpService, private toast: PrimeNgToastService) {
        super({
            isLoading: false,
            logInData: null,
            resetPassword: null,
            otpData: null,
        });
    }
    readonly otpdata$: Observable<any> = this.select((state) => state.otpData);
    readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);
    readonly resetPassword$: Observable<IResetPassword> = this.select((state) => state.resetPassword);
    readonly loginData = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                return this.service.login(req).pipe(
                    tapResponse(
                        (res) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('login successful');
                            return this.patchState({
                                isLoading: false,
                                logInData: res,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.showError(error.error.data.message);
                            this.patchState({ isLoading: false });
                        }
                    )
                );
            })
        );
    });
    readonly resetPassword = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                return this.service.resetPassword(req).pipe(
                    tapResponse(
                        (res) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success(res.data.message);
                            return this.patchState({
                                isLoading: false,
                                otpData: res.data,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.showError(error.error.data.message);
                            this.patchState({ isLoading: false });
                        }
                    )
                );
            })
        );
    });
    readonly verfyPasswordOtp = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                return this.service.verfyResetPasswordOtp(req).pipe(
                    tapResponse(
                        (res) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success(res.data.message);
                            return this.patchState({
                                isLoading: false,
                                resetPassword: res.data,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.showError(error.error.data.message);
                            this.patchState({ isLoading: false });
                        }
                    )
                );
            })
        );
    });
    private showError(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
