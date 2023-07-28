import { CommonModule } from '@angular/common';
import { NgModule, Inject, Injectable } from '@angular/core';
import { BaseFilterRequest, BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAllSegmentsResModel,
    ICommunicationStatuesType,
    ICommunicationTypeResModel,
    IDownloadFileUrlModel,
    IGetSegmentFileUrlToDownloadModel,
} from '@msg91/models/segmento-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RepeaterUrls, SegmentUrls, TriggerUrls } from '@msg91/urls/segmento';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { Params } from '@angular/router';
@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91SegmentoSegmentModule {}

@Injectable({
    providedIn: ServicesMsg91SegmentoSegmentModule,
})
export class SegmentService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.SegmentoBaseURL) private segmentoBaseUrl: any,
        @Inject(ProxyBaseUrls.SegmentoV1BaseURL) private segmentoV1BaseUrl: any
    ) {}

    public getSegments(
        request: BaseFilterRequest,
        phoneBookId: number
    ): Observable<BaseResponse<IPaginatedResponse<IAllSegmentsResModel[]>, BaseFilterRequest>> {
        return this.http.get<BaseResponse<IPaginatedResponse<any[]>, BaseFilterRequest>>(
            SegmentUrls.getSegmentsUrl(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString()),
            { ...request, ui_view: true }
        );
    }

    public getArchivedSegments(
        request: BaseFilterRequest,
        phoneBookId: number
    ): Observable<BaseResponse<IPaginatedResponse<IAllSegmentsResModel[]>, BaseFilterRequest>> {
        return this.http.get<BaseResponse<IPaginatedResponse<any[]>, BaseFilterRequest>>(
            SegmentUrls.getArchivedSegmentsUrl(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString()),
            { ...request, ui_view: true }
        );
    }

    public getSegmentDetails(
        phoneBookId: number,
        segmentId: number
    ): Observable<BaseResponse<IAllSegmentsResModel, null>> {
        return this.http
            .get(
                SegmentUrls.getSegmentDetailUrl(this.segmentoV1BaseUrl)
                    .replace(':phoneBookId', phoneBookId.toString())
                    .replace(':segmentId', segmentId.toString()),
                { ui_view: true }
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<IAllSegmentsResModel, null> = res;
                    data.queryString = {
                        phoneBookId,
                        segmentId,
                    };
                    return data;
                })
            );
    }

    public addSegment(request: any, phoneBookId: number): Observable<BaseResponse<IAllSegmentsResModel, any>> {
        return this.http
            .post(SegmentUrls.addSegmentUrl(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString()), {
                ...request,
                ui_view: true,
            })
            .pipe(
                map((res) => {
                    const data: BaseResponse<IAllSegmentsResModel, any> = res;
                    data.request = request;
                    return data;
                })
            );
    }

    public updateSegment(
        request: any,
        phoneBookId: number,
        segmentId: number
    ): Observable<BaseResponse<IAllSegmentsResModel, any>> {
        return this.http.patch<BaseResponse<IAllSegmentsResModel, any>>(
            SegmentUrls.updateSegmentUrl(this.segmentoV1BaseUrl)
                .replace(':phoneBookId', phoneBookId.toString())
                .replace(':segmentId', segmentId.toString()),
            { ...request, ui_view: true }
        );
    }

    public restoreSegment(phoneBookId: number, segmentId: number): Observable<any> {
        return this.http.patch<any>(
            SegmentUrls.restoreSegmentUrl(this.segmentoBaseUrl)
                .replace(':phoneBookId', phoneBookId.toString())
                .replace(':segmentId', segmentId.toString()),
            {}
        );
    }

    public getSegmentFileUrlToDownload(
        request: IGetSegmentFileUrlToDownloadModel,
        phoneBookId: number,
        segmentId: number
    ): Observable<BaseResponse<IDownloadFileUrlModel, IGetSegmentFileUrlToDownloadModel>> {
        return this.http.post<BaseResponse<IDownloadFileUrlModel, IGetSegmentFileUrlToDownloadModel>>(
            SegmentUrls.getExportUrlForSegmentFileUrl(this.segmentoBaseUrl)
                .replace(':phoneBookId', phoneBookId.toString())
                .replace(':segmentId', segmentId.toString()),
            request
        );
    }

    public getCommunicationTypes(): Observable<BaseResponse<ICommunicationTypeResModel[], any>> {
        return this.http.get<BaseResponse<ICommunicationTypeResModel[], any>>(
            SegmentUrls.getCommunicationTypesUrl(this.segmentoBaseUrl)
        );
    }

    public dynamicApiCallCommService(request: string, which: { name: string }): Observable<BaseResponse<any, any>> {
        return this.http.get(request).pipe(
            map((res) => {
                const data: BaseResponse<any, { name: string }> = res;
                data['request'] = which;
                return data;
            })
        );
    }

    public sendCommunication(request: any, phoneBookId): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, { id: number; index: number; name: string }>>(
            SegmentUrls.communication(this.segmentoBaseUrl).replace(':phoneBookId', phoneBookId.toString()),
            request
        );
    }

    public sendCommunicationForSegment(
        request: any,
        phoneBookId: number,
        segmentId: number
    ): Observable<BaseResponse<any, any>> {
        return this.http.post<BaseResponse<any, { id: number; index: number; name: string }>>(
            SegmentUrls.communicationForSegment(this.segmentoBaseUrl)
                .replace(':phoneBookId', phoneBookId.toString())
                .replace(':segmentId', segmentId.toString()),
            request
        );
    }

    public getCommunicationLogs(request: any, url: string): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(url, request);
    }

    public communicationStatues(): Observable<BaseResponse<ICommunicationStatuesType[], void>> {
        return this.http.get<BaseResponse<ICommunicationStatuesType[], void>>(
            SegmentUrls.communicationStatues(this.segmentoBaseUrl)
        );
    }

    public deleteSegment(phoneBookId: number, segmentId: number): Observable<BaseResponse<IAllSegmentsResModel, any>> {
        return this.http.delete<BaseResponse<IAllSegmentsResModel, any>>(
            SegmentUrls.updateSegmentUrl(this.segmentoBaseUrl)
                .replace(':phoneBookId', phoneBookId.toString())
                .replace(':segmentId', segmentId.toString())
        );
    }

    public getTriggerLogs(params: Params, segmentId: number): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(
            TriggerUrls.getTriggersLogs(this.segmentoBaseUrl).replace(':segmentId', segmentId.toString()),
            params
        );
    }

    public getRepeaterLogs(params: Params, segmentId: number): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(
            RepeaterUrls.getRepeatersLogs(this.segmentoBaseUrl).replace(':segmentId', segmentId.toString()),
            params
        );
    }

    public communicationLogForAllContacts(
        params: Params,
        bookId: number,
        segmentId: number
    ): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(
            SegmentUrls.communication(this.segmentoBaseUrl).replace(':phoneBookId', bookId.toString()),
            params
        );
    }

    public communicationForSegment(
        params: Params,
        bookId: number,
        segmentId: number
    ): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(
            SegmentUrls.communicationForSegment(this.segmentoBaseUrl)
                .replace(':phoneBookId', bookId.toString())
                .replace(':segmentId', segmentId.toString()),
            params
        );
    }
}
