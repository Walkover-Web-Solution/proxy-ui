import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAddCustomAttributeReqModel,
    ICustomAttributeFieldType,
    IGetCustomAttributeResModel,
    IMessageResponse,
    IUpdateUniqueFieldReq,
} from '@msg91/models/segmento-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomAttributesUrls } from '@msg91/urls/segmento';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91SegmentoCustomAttributeModule {}

@Injectable({
    providedIn: ServicesMsg91SegmentoCustomAttributeModule,
})
export class CustomAttributeService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.SegmentoBaseURL) private segmentoBaseUrl: any
    ) {}

    public getCustomAttributes(
        phoneBookId: number,
        request: { [key: string]: any } = {}
    ): Observable<BaseResponse<IGetCustomAttributeResModel[], number>> {
        return this.http.get<BaseResponse<IGetCustomAttributeResModel[], number>>(
            CustomAttributesUrls.getCustomAttributesUrl(this.segmentoBaseUrl).replace(
                ':phoneBookId',
                phoneBookId.toString()
            ),
            request
        );
    }

    public addCustomAttribute(request: IAddCustomAttributeReqModel, id: number): Observable<any> {
        return this.http.post<BaseResponse<IMessageResponse, IAddCustomAttributeReqModel>>(
            CustomAttributesUrls.addCustomAttributeUrl(this.segmentoBaseUrl).replace(':phoneBookId', id.toString()),
            request
        );
    }

    public getCustomAttributeFieldType(
        phoneBookId: number
    ): Observable<BaseResponse<ICustomAttributeFieldType[], number>> {
        return this.http
            .get(
                CustomAttributesUrls.addCustomAttributeFieldTypesUrl(this.segmentoBaseUrl).replace(
                    ':phoneBookId',
                    phoneBookId.toString()
                )
            )
            .pipe(
                map((res) => {
                    res?.data?.map((p) => {
                        if (Array.isArray(p.configurations) && p.configurations.length === 0) {
                            p.configurations = {};
                        }
                        return p;
                    });
                    return res;
                }),
                map((res) => {
                    const data: BaseResponse<any, number> = res;
                    return data;
                })
            );
    }

    public updateCustomAttribute(request: IAddCustomAttributeReqModel, id: string, fieldId: string): Observable<any> {
        return this.http
            .patch(
                CustomAttributesUrls.updateCustomAttributesUrl(this.segmentoBaseUrl)
                    .replace(':phoneBookId', id.toString())
                    .replace(':fieldId', fieldId),
                request
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<IMessageResponse, IAddCustomAttributeReqModel> = res;
                    data.request = request;
                    data.queryString = { fieldId: fieldId };
                    return data;
                })
            );
    }

    public updateUniqueField(request: IUpdateUniqueFieldReq, id: string, fieldId: string): Observable<any> {
        return this.http
            .patch(
                CustomAttributesUrls.updateCustomAttributesUrl(this.segmentoBaseUrl)
                    .replace(':phoneBookId', id.toString())
                    .replace(':fieldId', fieldId),
                request
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<IMessageResponse, IUpdateUniqueFieldReq> = res;
                    data.request = request;
                    data.queryString = { fieldId: fieldId };
                    return data;
                })
            );
    }

    public deleteCustomAttribute(
        phoneBookId: string,
        fieldId: string,
        type: 'archive' | 'delete'
    ): Observable<BaseResponse<any, string>> {
        const request = {
            ...(type === 'delete' && {
                delete_permanently: 1,
            }),
        };
        return this.http
            .delete(
                CustomAttributesUrls.updateCustomAttributesUrl(this.segmentoBaseUrl)
                    .replace(':phoneBookId', phoneBookId.toString())
                    .replace(':fieldId', fieldId),
                {},
                {
                    body: request,
                }
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, string> = res;
                    data.queryString = { fieldId: fieldId };
                    return data;
                })
            );
    }

    public restoreCustomAttribute(phoneBookId: string, fieldId: string): Observable<BaseResponse<any, string>> {
        return this.http
            .patch(
                CustomAttributesUrls.restoreCustomAttributesUrl(this.segmentoBaseUrl)
                    .replace(':phoneBookId', phoneBookId.toString())
                    .replace(':fieldId', fieldId),
                {}
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, string> = res;
                    data.queryString = { fieldId: fieldId };
                    return data;
                })
            );
    }

    public customAttributeBulkUpdate(payload: any, phoneBookId: string): Observable<BaseResponse<any, string>> {
        return this.http.post<BaseResponse<any, string>>(
            CustomAttributesUrls.updateCustomAttributesBulkSaveUrl(this.segmentoBaseUrl).replace(
                ':phoneBookId',
                phoneBookId.toString()
            ),
            payload
        );
    }

    public customAttributeDynamicApiCallService(
        request: string,
        which: { name: string; fieldName: string }
    ): Observable<BaseResponse<any, any>> {
        return this.http.get(request).pipe(
            map((res) => {
                const data: BaseResponse<any, { name: string; fieldName: string }> = res;
                data['request'] = which;
                return data;
            })
        );
    }
}
