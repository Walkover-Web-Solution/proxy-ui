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

    public getWidgetData(requestId: string): Observable<any> {
        //Observable<BaseResponse<IWidgetResponse, IGetWidgetData>>
        const url = otpVerificationUrls.getWidgetData(this.baseUrl).replace(':referenceId', requestId);
        return this.http.get<BaseResponse<IWidgetResponse, IGetWidgetData>>(url, {}, this.options);
        // return of({
        //     data: {
        //         ciphered:
        //             'VXRTQjk1VGpJcFVNUTh1ck9GbVZTVmhhM2crYlRJVFhsRWduVW1tUFVEVFVLRDBxMDlSbXZSeWZlQ3B3N3FEKzB1czEvTmZ2MFhseGxMeWI0SkVLWGtoRjczYVNrakJUL1R1cTdBeHkyYlNWYldCdmE1SVkxbW12aEcyQnBLVGhUMDAyMmg1ek01MWp3UWRZUnVxdUF6TmVnWHVlS3dpSXRicUdGNDE0eGhRa1JJOU9FN09mejhkQ1VUSk8vTUluMzJNcU1LSkNkWExVczlOM2hhaDgxclhHVkJYQ0xXclFSYk5aNlU4U2c3ekZ1bHJ1aHp4UVlLS0ZiMjFtOERMckdtckxycktMV25hMjN1WGRIMitjQ0NyM00xSUh4SzFQVmRSMEp6SjNubGZTYStvTUVEK0NQTDN3TG4vb2FiREpnbFRyZ0RjUTdaeHgvYnRlZWFuYWFRdjN5TE1PRUl0d2F6UTUvVjBNa1lROVhjRGRocExxd0YzUXlyL0xuZFlMTEE5dE1ZR0NvY3NvQmlMZjFOWDBSSUgyaXYvb3NPQ3l6QTFYazhrUU9CaFNwTnNreXdRRzdkeHBFRnUrWkNocGNLQ09jaUV2L1NnL1BBWHJZUVRoR25LT2k4d3VxWVE3SHpSRU9Rajc2c2UwRWcyT1ZMYU9iZHd2K1ByN2ZyR2FHWFFDa1BDSDhBSTlnRG8ya3B2SWFmQmp6eVJNTUJFbys0VTIxZEJKKzBCNzJZYUd2dXNQQU1QRGRLa2prNkVZVnRkOHYrbCtSdGVNbG5aUUcwUGZzSHU0Y3hYRms2U21sNlZhVEZheEJyUjQvWEo4K2JlQnFOM0dpMnR6Y2E3RWNZUlBDZHJwTFFvYllqWlZxSVA4aEFCbFZIVEJEYWhycFVNUDVHakdmSngyZGIxdDNmajFpbk1mdmhFWC9lTnNWMlpuck1ST1l2WjEveUszLzVzWkx5bytlZ3ppcCtZRTlSSU1QS0MvNEhQeEl6Tzczd3lyMFZ0TTRXQkNzVlgrRTJKWWhIbVI0dHVvemhRSGttZSswQT09',
        //     },
        // });
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
