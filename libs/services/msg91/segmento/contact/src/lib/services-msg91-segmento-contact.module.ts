import { CommonModule } from '@angular/common';
import { NgModule, Inject, Injectable } from '@angular/core';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IDeleteBulkContactReqModel,
    IDownloadFileUrlModel,
    IGetAllContactResModel,
    IGetAllContactsFilterReq,
    IGetContactsById,
    IGetSegmentFileUrlToDownloadModel,
    IMapContactAndFileReq,
    IMessageResponse,
    IUploadContactsByFileRes,
    IUploadFileReq,
} from '@msg91/models/segmento-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { ContactUrls } from '@msg91/urls/segmento';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91SegmentoContactModule {}

@Injectable({
    providedIn: ServicesMsg91SegmentoContactModule,
})
export class ContactsService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.SegmentoBaseURL) private baseUrl: any,
        @Inject(ProxyBaseUrls.SegmentoV1BaseURL) private segmentoV1BaseUrl: any
    ) {}

    public getAllContacts(
        params: IGetAllContactsFilterReq,
        phoneBookId: number
    ): Observable<BaseResponse<IPaginatedResponse<IGetAllContactResModel[]>, IGetAllContactsFilterReq>> {
        return this.http.post<BaseResponse<IPaginatedResponse<IGetAllContactResModel[]>, IGetAllContactsFilterReq>>(
            ContactUrls.getAllContactsUrl(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString()),
            params
        );
    }

    public addContact(
        request: { [key: string]: string },
        phoneBookId: number
    ): Observable<BaseResponse<IMessageResponse, { [key: string]: string }>> {
        return this.http.post<BaseResponse<IMessageResponse, { [key: string]: string }>>(
            ContactUrls.addContactsUrl(this.segmentoV1BaseUrl).replace(':phoneBookId', phoneBookId.toString()),
            request
        );
    }

    public updateContact(
        request: { [key: string]: string },
        phoneBookId: number,
        contactId: string
    ): Observable<BaseResponse<IMessageResponse, { [key: string]: string }>> {
        return this.http.patch<BaseResponse<IMessageResponse, { [key: string]: string }>>(
            ContactUrls.updateContactsUrl(this.segmentoV1BaseUrl)
                .replace(':phoneBookId', phoneBookId.toString())
                .replace(':contactId', contactId),
            request
        );
    }

    public getContactDetail(phoneBookId: number, contactId: string): Observable<BaseResponse<any, null>> {
        return this.http.get<BaseResponse<IGetContactsById, null>>(
            ContactUrls.getContactDetailUrl(this.segmentoV1BaseUrl)
                .replace(':phoneBookId', phoneBookId.toString())
                .replace(':contactId', contactId),
            { isObjectId: 1, ui_view: true }
        );
    }

    // not used any where.
    public deleteContact(
        phoneBookId: number,
        contactId: string,
        from: 'all' | 'segment'
    ): Observable<BaseResponse<any, any>> {
        return this.http
            .delete(
                ContactUrls.deleteContactUrl(this.baseUrl)
                    .replace(':phoneBookId', phoneBookId.toString())
                    .replace(':contactId', contactId.toString()),
                { isObjectId: 1 }
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, any> = res;
                    data.request = { from: from, contactId: contactId };
                    return data;
                })
            );
    }

    public deleteBulkContact(
        request: IDeleteBulkContactReqModel,
        phoneBookId: number,
        from: 'all' | 'segment'
    ): Observable<BaseResponse<any, any>> {
        return this.http
            .delete(
                ContactUrls.deleteBulkContactUrl(this.baseUrl).replace(':phoneBookId', phoneBookId.toString()),
                {},
                { body: request }
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, any> = res;
                    data.request = { from: from, contactId: request.contact_Ids };
                    return data;
                })
            );
    }

    public getContactsByFilter(
        request: any,
        phoneBookId: number
    ): Observable<BaseResponse<IPaginatedResponse<any>, any>> {
        return this.http.post<BaseResponse<any, any>>(
            ContactUrls.getContactByFilterUrl(this.baseUrl).replace(':phoneBookId', phoneBookId.toString()),
            request
        );
    }

    public uploadContactsByFile(request: IUploadFileReq, phoneBookId: number): Observable<BaseResponse<any, any>> {
        const newPostRequest: FormData = new FormData();
        Object.keys(request).forEach((x) => {
            newPostRequest.append(x, request[x]);
        });
        return this.http.post<BaseResponse<IUploadContactsByFileRes, IUploadFileReq>>(
            ContactUrls.uploadContactsByFileUrl(this.baseUrl).replace(':phoneBookId', phoneBookId.toString()),
            newPostRequest
        );
    }

    public mapContactAndFile(request: IMapContactAndFileReq, phoneBookId: number): Observable<any> {
        return this.http.post<any>(
            ContactUrls.uploadContactsByFileUrl(this.baseUrl).replace(':phoneBookId', phoneBookId.toString()),
            request,
            {
                reportProgress: true,
                observe: 'events',
            }
        );
    }

    public getContactFileUrlToDownload(
        request: IGetSegmentFileUrlToDownloadModel,
        phoneBookId: number
    ): Observable<BaseResponse<IDownloadFileUrlModel, IGetSegmentFileUrlToDownloadModel>> {
        return this.http.post<BaseResponse<IDownloadFileUrlModel, IGetSegmentFileUrlToDownloadModel>>(
            ContactUrls.getExportUrlForContactFileUrl(this.baseUrl).replace(':phoneBookId', phoneBookId.toString()),
            request
        );
    }

    public getImportContactLogDetail(request: any, phoneBookId: string): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(
            ContactUrls.uploadContactsByFileUrl(this.baseUrl).replace(':phoneBookId', phoneBookId),
            request
        );
    }

    public getImportLogStatus(): Observable<BaseResponse<any, null>> {
        return this.http.get<BaseResponse<IGetContactsById, null>>(ContactUrls.importLogsStatus(this.baseUrl));
    }

    public getCodeSnippet(phoneBookId: string, crudType: string): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(
            ContactUrls.getCodeSnippet(this.segmentoV1BaseUrl)
                .replace(':phonebookId', phoneBookId)
                .replace(':crudType', crudType)
        );
    }
}
