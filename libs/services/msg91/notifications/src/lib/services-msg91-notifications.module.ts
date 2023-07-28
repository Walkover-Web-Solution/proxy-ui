import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { NotificationsUrls } from '@msg91/urls/notifications';
import {
    INotificationCreateReq,
    INotificationUpdateReq,
    INotificationTemplateRes,
    INotificationTemplateData,
} from '@msg91/models/notifications-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91NotificationsModule {}

@Injectable({
    providedIn: ServicesMsg91NotificationsModule,
})
export class NotificationServices {
    constructor(
        private _http: HttpWrapperService,
        @Inject(ProxyBaseUrls.PushNotificationProxy) private pushNotificationAPI: string
    ) {}

    postClientTemplate(payload: INotificationCreateReq): Observable<BaseResponse<string, INotificationCreateReq>> {
        return this._http.post<string>(NotificationsUrls.postClientTemplate(this.pushNotificationAPI), payload);
    }

    getClientTemplate(params: any): Observable<BaseResponse<INotificationTemplateRes, any>> {
        return this._http.get<INotificationTemplateRes>(
            NotificationsUrls.getClientTemplate(this.pushNotificationAPI),
            params
        );
    }

    updateClientTemplate(
        payload: Partial<INotificationUpdateReq>,
        id: number
    ): Observable<BaseResponse<INotificationTemplateData, Partial<INotificationUpdateReq>>> {
        return this._http.put<INotificationTemplateData>(
            NotificationsUrls.updateClientTemplate(this.pushNotificationAPI).replace(':id', String(id)),
            payload
        );
    }
}
