import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, ILineGraphData, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IIntegrationReqModel,
    ILogReqModel,
    ILogRespModel,
    IRCSList,
    IRCSLogsDropdown,
    IRCSRegistrationDropdown,
    IRCSReportPercentageRespModel,
    IRegistrationRespModel,
    IReportReqModel,
} from '@msg91/models/rcs-models';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { RcsUrls } from '@msg91/urls/client-rcs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91RcsModule {}

@Injectable({
    providedIn: ServicesMsg91RcsModule,
})
export class RcsIntegrationService {
    constructor(private _http: HttpWrapperService, @Inject(ProxyBaseUrls.RcsProxy) private rcsBaseUrl: string) {}

    getRcsIntegrationList(): Observable<BaseResponse<IRCSList[], any>> {
        return this._http.get(RcsUrls.getRcsIntegration(this.rcsBaseUrl));
    }

    updateRcsIntegrationList(payload: any, id: string): Observable<BaseResponse<any, any>> {
        return this._http.put(RcsUrls.getRcsIntegration(this.rcsBaseUrl) + id + '/', payload);
    }

    getRcsIntegrationData(id: number): Observable<BaseResponse<IRegistrationRespModel, any>> {
        return this._http.get(RcsUrls.getRcsIntegration(this.rcsBaseUrl) + id + '/');
    }

    postRcsIntegration(request: IIntegrationReqModel): Observable<BaseResponse<string, IIntegrationReqModel>> {
        const newPostRequest: FormData = new FormData();
        Object.keys(request).forEach((x) => {
            newPostRequest.append(x, request[x]);
        });
        return this._http.post(RcsUrls.createRcsIntegration(this.rcsBaseUrl), newPostRequest).pipe(
            map((response: BaseResponse<string, IIntegrationReqModel>) => {
                response.request = request;
                return response;
            })
        );
    }

    deleteRcsIntegration(id): Observable<BaseResponse<string, string>> {
        return this._http.delete<BaseResponse<string, string>>(RcsUrls.deleteIntegration(this.rcsBaseUrl) + id + '/');
    }

    getRcsLog(request: ILogReqModel): Observable<BaseResponse<ILogRespModel, ILogReqModel>> {
        let params = new HttpParams();
        if (request.customer_number?.length) {
            params = params.append('customer_number', request.customer_number.toString());
        }
        if (request.from_date) {
            // tslint:disable-next-line:radix
            params = params.append('from_date', parseInt((request.from_date.getTime() / 1000).toString()).toString());
        }
        if (request.to_date) {
            // tslint:disable-next-line:radix
            params = params.append('to_date', parseInt((request.to_date.getTime() / 1000).toString()).toString());
        }
        if (request.failure_reason) {
            params = params.append('failure_reason', request.failure_reason);
        }
        if (request.status) {
            params = params.append('status', request.status);
        }
        if (request.page_number) {
            params = params.append('page_number', request.page_number.toString());
        }
        if (request.page_size) {
            params = params.append('page_size', request.page_size.toString());
        }
        if (request.direction) {
            params = params.append('direction', request.direction.toString());
        }
        if (request.order_by) {
            params = params.append('order_by', request.order_by);
        }
        if (request.order_type) {
            params = params.append('order_type', request.order_type);
        }
        if (request.client_name) {
            params = params.append('client_name', request.client_name);
        }
        return this._http.get<BaseResponse<ILogRespModel, ILogReqModel>>(RcsUrls.getRcsLog(this.rcsBaseUrl), params);
    }

    getRcsReport(request: IReportReqModel): Observable<BaseResponse<ILineGraphData[], IReportReqModel>> {
        let params = new HttpParams();
        // tslint:disable-next-line:radix
        params = params.append('from_date', parseInt((request.from_date.getTime() / 1000).toString()).toString());
        // tslint:disable-next-line:radix
        params = params.append('to_date', parseInt((request.to_date.getTime() / 1000).toString()).toString());
        return this._http.get<BaseResponse<ILineGraphData[], IReportReqModel>>(
            RcsUrls.getRcsReport(this.rcsBaseUrl),
            params
        );
    }

    getRcsReportPercentage(
        request: IReportReqModel
    ): Observable<BaseResponse<IRCSReportPercentageRespModel, IReportReqModel>> {
        const payload = {
            from_date: parseInt((request.from_date.getTime() / 1000).toString()).toString(),
            to_date: parseInt((request.to_date.getTime() / 1000).toString()).toString(),
        };
        return this._http.post<BaseResponse<IRCSReportPercentageRespModel, IReportReqModel>>(
            RcsUrls.getRcsReport(this.rcsBaseUrl),
            payload
        );
    }

    getRcsBanner(id: number): Observable<BaseResponse<any, any>> {
        return this._http.get(RcsUrls.getRcsIntegrationBannerImage(this.rcsBaseUrl, id), {}, { responseType: 'blob' });
    }

    getRcsImage(id: number): Observable<BaseResponse<any, any>> {
        return this._http.get(RcsUrls.getRcsIntegrationLogoImage(this.rcsBaseUrl, id), {}, { responseType: 'blob' });
    }

    getRegistrationDownData(): Observable<BaseResponse<IRCSRegistrationDropdown, any>> {
        return this._http.get<BaseResponse<IRCSRegistrationDropdown, any>>(
            RcsUrls.getRcsIntegrationDropdown(this.rcsBaseUrl)
        );
    }

    getRcsLogsDropdown(): Observable<BaseResponse<IRCSLogsDropdown, any>> {
        return this._http.get<BaseResponse<IRCSLogsDropdown, any>>(RcsUrls.getRcsLogsDropdown(this.rcsBaseUrl));
    }
}
