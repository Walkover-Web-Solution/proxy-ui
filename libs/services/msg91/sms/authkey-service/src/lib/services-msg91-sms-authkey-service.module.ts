import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { AuthKeyUrls } from '@msg91/urls/sms';
import { map } from 'rxjs/operators';
import {
    IAddWhitelistIpReq,
    IApiPageAccessValidation,
    IAuthenticationKeyActionDetailsRes,
    IAuthKey,
    IAuthKeyRes,
    IAuthKeyResData,
    IEditAuthKeyReq,
    IGenerateAuthKeyReq,
    IIPSecurityStatus,
    INonWhitelistedIPsResData,
    IToggleAuthkeyIPSecurityReq,
    IToggleAuthkeyReq,
    IToggleCompanyIPSecurityReq,
    IWhitelistedIPsResData,
} from '@msg91/models/authkey-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91SmsAuthkeyServiceModule {}

@Injectable({
    providedIn: ServicesMsg91SmsAuthkeyServiceModule,
})
export class AuthKeyService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any) {}

    public getAllAuthenticationKeys(params: any): Observable<BaseResponse<IAuthKeyResData, any>> {
        return this.http.get<BaseResponse<IAuthKeyResData, any>>(
            AuthKeyUrls.getAllAuthenticationKeys(this.baseUrl),
            params
        );
    }

    public generateAuthKey(payload: IGenerateAuthKeyReq): Observable<BaseResponse<IAuthKeyRes, IGenerateAuthKeyReq>> {
        return this.http.post<BaseResponse<IAuthKeyRes, IGenerateAuthKeyReq>>(
            AuthKeyUrls.generateAuthKey(this.baseUrl),
            payload
        );
    }

    public editNewAuthkey(payload: IEditAuthKeyReq): Observable<BaseResponse<{ msg: string }, IEditAuthKeyReq>> {
        return this.http.post<BaseResponse<{ msg: string }, IEditAuthKeyReq>>(
            AuthKeyUrls.editNewAuthkey(this.baseUrl),
            payload
        );
    }

    public deleteAuthkey(payload: string): Observable<BaseResponse<{ msg: string }, any>> {
        return this.http.delete<BaseResponse<string, string>>(
            AuthKeyUrls.deleteAuthkey(this.baseUrl).replace(':authkey', payload)
        );
    }

    public getWhitelistedIPs(payload: IAuthKey): Observable<BaseResponse<IWhitelistedIPsResData, IAuthKey>> {
        return this.http.get<BaseResponse<IWhitelistedIPsResData, IAuthKey>>(
            AuthKeyUrls.getWhitelistedIPs(this.baseUrl),
            payload
        );
    }

    public enableDisableAuthkeyIPSecurity(
        payload: IToggleAuthkeyIPSecurityReq
    ): Observable<BaseResponse<any, IToggleAuthkeyIPSecurityReq>> {
        return this.http.post<BaseResponse<any, IToggleAuthkeyIPSecurityReq>>(
            AuthKeyUrls.enableDisableAuthkeyIPSecurity(this.baseUrl),
            payload
        );
    }

    public enableDisableAuthkey(payload: IToggleAuthkeyReq): Observable<BaseResponse<any, IToggleAuthkeyReq>> {
        return this.http.post<BaseResponse<any, IToggleAuthkeyReq>>(
            AuthKeyUrls.enableDisableAuthkey(this.baseUrl),
            payload
        );
    }

    public addWhitelistIp(
        payload: IAddWhitelistIpReq
    ): Observable<BaseResponse<IWhitelistedIPsResData, IAddWhitelistIpReq>> {
        return this.http.post<BaseResponse<IWhitelistedIPsResData, IAddWhitelistIpReq>>(
            AuthKeyUrls.addWhitelistIp(this.baseUrl),
            payload
        );
    }

    public deleteWhitelistIP(id: string): Observable<BaseResponse<any, string>> {
        return this.http.post<BaseResponse<any, string>>(AuthKeyUrls.deleteWhitelistIP(this.baseUrl), { id: id });
    }

    public getAllNonWhitelistedIPs(): Observable<BaseResponse<INonWhitelistedIPsResData, null>> {
        return this.http.get<BaseResponse<INonWhitelistedIPsResData, null>>(
            AuthKeyUrls.getAllNonWhitelistedIPs(this.baseUrl)
        );
    }

    public getAuthenticationKeyActionDetails(
        payload: IAuthKey
    ): Observable<BaseResponse<{ data: IAuthenticationKeyActionDetailsRes[] }, IAuthKey>> {
        return this.http.get<BaseResponse<{ data: IAuthenticationKeyActionDetailsRes[] }, IAuthKey>>(
            AuthKeyUrls.getAuthenticationKeyActionDetails(this.baseUrl),
            payload
        );
    }

    public apiPageAccessValidation(): Observable<BaseResponse<IApiPageAccessValidation, null>> {
        return this.http.get<BaseResponse<IApiPageAccessValidation, null>>(
            AuthKeyUrls.apiPageAccessValidation(this.baseUrl)
        );
    }

    public enableDisableIPSecurity(
        payload: IToggleCompanyIPSecurityReq
    ): Observable<BaseResponse<IIPSecurityStatus, IToggleCompanyIPSecurityReq>> {
        return this.http.post<BaseResponse<IIPSecurityStatus, IToggleCompanyIPSecurityReq>>(
            AuthKeyUrls.enableDisableIPSecurity(this.baseUrl),
            payload
        );
    }

    public getIpSecuritySetting(): Observable<BaseResponse<IIPSecurityStatus, null>> {
        return this.http.get<BaseResponse<IIPSecurityStatus, null>>(AuthKeyUrls.getIpSecuritySetting(this.baseUrl));
    }

    public getAuthkeyUsecase(request: { [key: string]: any }): Observable<BaseResponse<string[], null>> {
        return this.http.get<BaseResponse<string[], null>>(AuthKeyUrls.getAuthkeyUsecase(this.baseUrl), request);
    }
}
