import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { TelegramAdminClientUrls } from '@msg91/urls/telegram';
import { map } from 'rxjs/operators';
import { ITelegramAdminClientResponse, ITelegramAdminClientUpdateReq } from '@msg91/models/telegram-models';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminTelegramModule {}

@Injectable({
    providedIn: ServicesAdminTelegramModule,
})
export class TelegramAdminClientService {
    public options = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': '',
        },
        withCredentials: false,
    };
    constructor(
        private http: HttpWrapperService,
        private authService: AuthService,
        @Inject(ProxyBaseUrls.RcsProxy) private rcsUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken
    ) {}

    public getTelegramClientsData(params: any): Observable<BaseResponse<ITelegramAdminClientResponse, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...params };
        return this.http.get<BaseResponse<ITelegramAdminClientResponse, any>>(
            TelegramAdminClientUrls.getClientData(this.rcsUrl),
            newParam,
            this.options
        );
    }

    public updateClientData(
        payload: ITelegramAdminClientUpdateReq,
        integrationId: number
    ): Observable<BaseResponse<ITelegramAdminClientResponse, ITelegramAdminClientUpdateReq>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.put<BaseResponse<ITelegramAdminClientResponse, ITelegramAdminClientUpdateReq>>(
            TelegramAdminClientUrls.updateClientData(this.rcsUrl).replace(':integrationId', integrationId.toString()),
            payload,
            this.options
        );
    }
}
