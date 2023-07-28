import { NgModule, Injectable, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { TelegramClientUrls } from '@msg91/urls/telegram';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { map } from 'rxjs/operators';
import {
    IIntegrationsData,
    IQrIntegrateBotRes,
    ITelegramClientIntegrationDataRes,
    ITelegramClientIntegrationReq,
    ITelegramClientQRIntegrationReq,
    ITelegramUpdateReq,
} from '@msg91/models/telegram-models';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91TelegramModule {}

@Injectable({
    providedIn: ServicesMsg91TelegramModule,
})
export class TelegramService {
    constructor(@Inject(ProxyBaseUrls.RcsProxy) private rcsUrl: any, private http: HttpWrapperService) {}

    public qrIntegration(body: ITelegramClientQRIntegrationReq): Observable<BaseResponse<IQrIntegrateBotRes, any>> {
        return this.http.post<BaseResponse<IQrIntegrateBotRes, any>>(
            TelegramClientUrls.qrIntegration(this.rcsUrl),
            body
        );
    }

    public getQrIntegration(uuid: string): Observable<BaseResponse<IQrIntegrateBotRes, any>> {
        return this.http.get<BaseResponse<any, any>>(TelegramClientUrls.qrIntegration(this.rcsUrl) + `${uuid}/`);
    }

    public getQrUrl(params: any): Observable<BaseResponse<string, null>> {
        return this.http.get<BaseResponse<string, null>>(TelegramClientUrls.getQrUrl(this.rcsUrl), params);
    }

    public addIntegration(
        body: ITelegramClientIntegrationReq
    ): Observable<BaseResponse<any, ITelegramClientIntegrationReq>> {
        return this.http.post<BaseResponse<any, ITelegramClientIntegrationReq>>(
            TelegramClientUrls.integrateBot(this.rcsUrl),
            body
        );
    }

    public getIntegrationData(params: any): Observable<BaseResponse<ITelegramClientIntegrationDataRes, null>> {
        return this.http.get<BaseResponse<ITelegramClientIntegrationDataRes, null>>(
            TelegramClientUrls.getIntegration(this.rcsUrl),
            params
        );
    }

    public updateIntegration(
        req: ITelegramUpdateReq,
        integrationId: number
    ): Observable<BaseResponse<IIntegrationsData, ITelegramUpdateReq>> {
        return this.http.put<BaseResponse<IIntegrationsData, ITelegramUpdateReq>>(
            TelegramClientUrls.updateIntegration(this.rcsUrl).replace(':integrationId', integrationId.toString()),
            req
        );
    }

    public getTemplates(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(TelegramClientUrls.getTemplates(this.rcsUrl), params);
    }

    public createTemplate(req: any): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, any>>(TelegramClientUrls.createTemplate(this.rcsUrl), req);
    }

    public editTemplateStatus(id: string, req: { is_active: boolean }): Observable<BaseResponse<any, any>> {
        return this.http.put<BaseResponse<any, any>>(
            TelegramClientUrls.editTemplateStatus(this.rcsUrl).replace(':id', id),
            req
        );
    }

    public getTemplateStruct(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(TelegramClientUrls.getTemplateStruct(this.rcsUrl), params);
    }
}
