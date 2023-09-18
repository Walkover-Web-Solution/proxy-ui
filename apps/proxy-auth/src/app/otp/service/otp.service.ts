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

    public getWidgetData(requestId: string): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        const url = otpVerificationUrls.getWidgetData(this.baseUrl).replace(':referenceId', requestId);
        return this.http.get<BaseResponse<IWidgetResponse, IGetWidgetData>>(url, {}, this.options);
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
}
