import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseFilterRequest, BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TriggerUrls } from '@msg91/urls/segmento';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91SegmentoTriggersModule {}

@Injectable({
    providedIn: ServicesMsg91SegmentoTriggersModule,
})
export class TriggerService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.SegmentoBaseURL) private baseUrl: any,
        @Inject(ProxyBaseUrls.SegmentoV1BaseURL) private segmentoV1BaseUrl: any
    ) {}

    public getTriggers(
        request: any,
        segmentId: number
    ): Observable<BaseResponse<IPaginatedResponse<any[]>, BaseFilterRequest>> {
        return this.http.get<BaseResponse<IPaginatedResponse<any[]>, BaseFilterRequest>>(
            TriggerUrls.getTriggersUrl(this.baseUrl).replace(':segmentId', segmentId.toString()),
            request
        );
    }

    public getTrigger(segmentId: number, triggerId: number): Observable<BaseResponse<any, null>> {
        return this.http.get<BaseResponse<any, null>>(
            TriggerUrls.getUpdateDeleteTrigger(this.baseUrl)
                .replace(':segmentId', segmentId.toString())
                .replace(':triggerId', triggerId.toString())
        );
    }

    public createTrigger(body: any, segmentId: number): Observable<BaseResponse<any, null>> {
        return this.http.post<BaseResponse<any, null>>(
            TriggerUrls.createTriggerUrl(this.segmentoV1BaseUrl).replace(':segmentId', segmentId.toString()),
            { ...body, ui_view: true }
        );
    }

    public updateTrigger(body: any, segmentId: number, triggerId: number): Observable<BaseResponse<any, null>> {
        return this.http.patch<BaseResponse<any, null>>(
            TriggerUrls.getUpdateDeleteTrigger(this.segmentoV1BaseUrl)
                .replace(':segmentId', segmentId.toString())
                .replace(':triggerId', triggerId.toString()),
            { ...body, ui_view: true }
        );
    }

    public deleteTrigger(segmentId: number, triggerId: number): Observable<BaseResponse<any, number>> {
        return this.http
            .delete(
                TriggerUrls.getUpdateDeleteTrigger(this.baseUrl)
                    .replace(':segmentId', segmentId.toString())
                    .replace(':triggerId', triggerId.toString())
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, number> = res;
                    data.request = triggerId;
                    return data;
                })
            );
    }
}
