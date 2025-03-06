import { Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable, of } from 'rxjs';
import { omit } from 'lodash-es';
import { map } from 'rxjs/operators';
import { OtpResModel, ISendOtpReq, IRetryOtpReq, IVerifyOtpReq, IWidgetResponse, IGetWidgetData } from '../model/otp';
import { otpVerificationUrls } from './urls/otp-urls';
import { HttpWrapperService } from '@proxy/services/http-wrapper-no-auth';

@Injectable()
export class OtpService {
    public options = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        withCredentials: false,
    };

    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any) {}

    public getWidgetData(
        requestId: string,
        payload?: { [key: string]: any }
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        const url = otpVerificationUrls.getWidgetData(this.baseUrl).replace(':referenceId', requestId);
        return this.http.post<BaseResponse<IWidgetResponse, IGetWidgetData>>(url, payload ?? {}, this.options);
    }

    public sendOtp(request: ISendOtpReq): Observable<OtpResModel> {
        const referenceId = request.referenceId;
        return this.http.post<OtpResModel>(
            otpVerificationUrls.sendOtp(this.baseUrl).replace(':referenceId', referenceId),
            omit(request, 'referenceId'),
            this.options
        );
    }

    public resendOtpService(request: IRetryOtpReq): Observable<OtpResModel> {
        return this.http.post(otpVerificationUrls.resend(this.baseUrl), request, this.options).pipe(
            map((res) => {
                const data: OtpResModel = res;
                return data;
            })
        );
    }

    public verifyOtpService(request: IVerifyOtpReq): Observable<OtpResModel> {
        return this.http.post<OtpResModel>(otpVerificationUrls.verifyOtp(this.baseUrl), request, this.options);
    }

    public getIpInfo(requestUrl: any): Observable<any> {
        return this.http.get<any>(requestUrl, {}, this.options);
    }

    public callBackUrl(requestUrl: any, params: { [key: string]: any } = {}): Observable<any> {
        return this.http.get<any>(requestUrl, params, this.options);
    }

    public register(body: { proxy_state?: string }): Observable<any> {
        return this.http.post<any>(otpVerificationUrls.register(this.baseUrl), body, this.options);
    }

    public login(body): Observable<any> {
        return this.http.post<any>(otpVerificationUrls.login(this.baseUrl), body, this.options);
    }

    public resetPassword(body): Observable<any> {
        return this.http.post<any>(otpVerificationUrls.resetPassword(this.baseUrl), body, this.options);
    }
    public verfyResetPasswordOtp(body): Observable<any> {
        return this.http.post<any>(otpVerificationUrls.verifyPasswordOtp(this.baseUrl), body, this.options);
    }
    public getUserDetailsData(
        requestId: any,
        payload?: { [key: string]: any }
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = requestId;
        const url = otpVerificationUrls.getUserDetails('https://routes.msg91.com/api');
        return this.http.get<BaseResponse<IWidgetResponse, IGetWidgetData>>(url, payload ?? {}, this.options);
    }
}
