import { Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    OtpResModel,
    ISendOtpReq,
    IRetryOtpReq,
    IVerifyOtpReq,
    IVerifyOtpV2Req,
    IRegisterReq,
    IWidgetResponse,
    IGetWidgetData,
} from '../model/otp';
import { otpVerificationUrls } from './urls/otp-urls';
import { HttpWrapperService } from '@proxy/services/http-wrapper-no-auth';
import { environment } from 'apps/36-blocks-widget/src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class OtpService {
    public options = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        @Inject(ProxyBaseUrls.ClientURL) private clientUrl: any
    ) {}

    private setOtpRequestHeaders(request: { referenceId?: string; authToken?: string; origin?: string }): void {
        if (request.authToken) {
            this.options.headers['proxy_auth_token'] = request.authToken;
            delete this.options.headers['reference_id'];
        } else if (request.referenceId) {
            this.options.headers['reference_id'] = request.referenceId;
            delete this.options.headers['proxy_auth_token'];
        }
        const origin =
            request.origin ??
            (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : undefined);
        if (origin) {
            this.options.headers['origin'] = origin;
        }
    }

    public getWidgetData(
        requestId: string,
        payload?: { [key: string]: any }
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        const url = otpVerificationUrls.getWidgetData(this.baseUrl).replace(':referenceId', requestId);
        return this.http.post<BaseResponse<IWidgetResponse, IGetWidgetData>>(url, payload ?? {}, this.options);
    }

    public sendOtp(request: ISendOtpReq): Observable<OtpResModel> {
        this.setOtpRequestHeaders(request);
        const body = { identifier: request.identifier ?? request.mobile };
        return this.http.post<OtpResModel>(otpVerificationUrls.sendOtp(this.baseUrl), body, this.options);
    }

    public retryOtp(request: ISendOtpReq): Observable<OtpResModel> {
        this.setOtpRequestHeaders(request);
        const body = { identifier: request.identifier ?? request.mobile };
        return this.http.post<OtpResModel>(otpVerificationUrls.retryOtp(this.baseUrl), body, this.options);
    }
    public verifyOtpV2(request: IVerifyOtpV2Req): Observable<any> {
        this.setOtpRequestHeaders(request);
        const body = {
            identifier: request.identifier ?? request.mobile,
            otp: request.otp,
        };
        return this.http.post<any>(otpVerificationUrls.verifyOtpV2(this.baseUrl), body, this.options);
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

    public register(body: IRegisterReq): Observable<any> {
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
        const url = otpVerificationUrls.getUserDetails(this.clientUrl);
        return this.http.get<BaseResponse<IWidgetResponse, IGetWidgetData>>(url, payload ?? {}, this.options);
    }

    public getOrganizationDetails(authToken: string): Observable<any> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.getUserDetails(this.clientUrl);
        return this.http.get<any>(url, { fields: 'currentCompany' }, this.options);
    }

    public getTimezones(authToken: string): Observable<any> {
        const options = {
            ...this.options,
            headers: {
                ...this.options.headers,
                Authorization: authToken,
            },
        };
        const url = otpVerificationUrls.getTimezones(this.clientUrl);
        return this.http.get<any>(url, {}, options);
    }

    public updateCompany(
        authToken: string,
        company: { name: string; email: string; mobile: string; timezone: string; timeZoneName: string }
    ): Observable<any> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.updateCompany(this.clientUrl);
        return this.http.put<any>(url, { company }, this.options);
    }

    public leaveCompanyUser(
        companyId: any,
        authToken: string
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.leaveCompany(this.clientUrl);
        return this.http.post<any>(url, { company_id: companyId }, this.options);
    }

    public updateUser(
        name: string,
        authToken: string,
        mobile?: string,
        otpVerificationToken?: string
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.updateUser(this.clientUrl);
        const user: { name: string; mobile?: string } = { name };
        if (mobile !== undefined) {
            user.mobile = mobile;
        }
        const body: { user: typeof user; otp_verification_token?: string } = { user };
        if (otpVerificationToken) {
            body.otp_verification_token = otpVerificationToken;
        }
        return this.http.put<any>(url, body, this.options);
    }
    public addUser(payload: any, authToken: string): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.addUser(this.clientUrl);
        return this.http.post<any>(url, payload, this.options);
    }

    public getRoles(
        authToken: string,
        itemsPerPage?: number
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.createRole(this.clientUrl);
        const queryParams = itemsPerPage ? { itemsPerPage } : {};
        return this.http.get<any>(url, queryParams, this.options);
    }
    public createRole(
        name: string,
        cPermissions: string[],
        authToken: string
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.createRole(this.clientUrl);
        return this.http.post<any>(url, { name, cPermissions }, this.options);
    }
    public getCompanyUsers(
        authToken: string,
        itemsPerPage?: number,
        pageNo?: number,
        search?: string,
        exclude_role_ids?: number[],
        include_role_ids?: number[]
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.getCompanyUsers(this.clientUrl);
        const queryParams: any = {};
        if (itemsPerPage) queryParams.itemsPerPage = itemsPerPage;
        if (pageNo !== undefined) queryParams.pageNo = pageNo + 1; // Convert 0-based to 1-based index
        if (search) queryParams.search = search;
        if (exclude_role_ids?.length) queryParams.exclude_role_ids = exclude_role_ids.join(',');
        if (include_role_ids?.length) queryParams.role_ids = include_role_ids.join(',');
        return this.http.get<any>(url, queryParams, this.options);
    }
    public createPermission(
        name: string,
        authToken: string
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.createPermission(this.clientUrl);
        return this.http.post<any>(url, { name }, this.options);
    }
    public getPermissions(
        authToken: string,
        itemsPerPage?: number
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.createPermission(this.clientUrl);
        const queryParams: any = {};
        if (itemsPerPage) queryParams.itemsPerPage = itemsPerPage;
        return this.http.get<any>(url, queryParams, this.options);
    }
    public updateCompanyUser(
        payload: any,
        authToken: string
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.updateUser(this.clientUrl);
        return this.http.put<any>(url, payload, this.options);
    }
    public updatePermission(
        payload: any,
        authToken: string
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const name = payload.name;
        const url = otpVerificationUrls.updatePermission(this.clientUrl).replace(':id', payload.id);
        return this.http.put<any>(url, { name }, this.options);
    }
    public updateRole(payload: any, authToken: string): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.updateRole(this.clientUrl).replace(':id', payload.id);
        return this.http.put<any>(url, payload, this.options);
    }
    public getSubscriptionPlans(
        referenceId: string,
        authToken?: string
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        if (authToken) {
            this.options.headers['proxy_auth_token'] = authToken;
        }
        const url = otpVerificationUrls.getSubscriptionPlans(this.clientUrl).replace(':referenceId', referenceId);
        return this.http.get<any>(url, {}, this.options);
    }
    public upgradeSubscription(
        referenceId: string,
        payload: any,
        authToken?: string
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        if (authToken) {
            this.options.headers['proxy_auth_token'] = authToken;
        }
        const url = otpVerificationUrls.upgradeSubscription(this.clientUrl).replace(':referenceId', referenceId);
        return this.http.post<any>(url, payload, this.options);
    }
    public deleteUser(companyId: any, authToken: string): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.deleteUser(this.clientUrl).replace(':id', companyId);
        return this.http.delete<any>(url, {}, this.options);
    }
    public updateUserRole(payload: any, authToken: string): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.updateUserRole(this.clientUrl).replace(':id', payload.id);
        return this.http.put<any>(url, payload, this.options);
    }
    public updateUserPermission(
        payload: any,
        authToken: string
    ): Observable<BaseResponse<IWidgetResponse, IGetWidgetData>> {
        this.options.headers['proxy_auth_token'] = authToken;
        const url = otpVerificationUrls.updateUserPermission(this.clientUrl).replace(':id', payload.id);
        return this.http.put<any>(url, payload, this.options);
    }
}
