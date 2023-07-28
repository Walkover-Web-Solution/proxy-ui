import { Inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { ITransactionLogsReq, ITransactionLogsRes } from '@msg91/models/subscription-models';
import { ClientTransactionLogsUrls } from '@msg91/urls/subscription';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class TransactionLogsServices {
    constructor(@Inject(ProxyBaseUrls.BaseURL) private baseURL: any, private http: HttpWrapperService) {}
    /**
     * Get All Transaction Logs
     *
     * @param {*} params
     * @return {*}  {Observable<BaseResponse<ITransactionLogsRes, null>>}
     * @memberof ServicesMsg91TransactionLogsModule
     */
    public getLogs(params: any): Observable<BaseResponse<ITransactionLogsRes, ITransactionLogsReq>> {
        return this.http.get<BaseResponse<ITransactionLogsRes, null>>(
            ClientTransactionLogsUrls.fetchLogs(this.baseURL),
            params
        );
    }

    /**
     * Export all logs
     *
     * @param {*} params
     * @return {*}  {Observable<string>}
     * @memberof TransactionLogsServices
     */
    public getExportLogs(params: any): Observable<string> {
        return this.http.get<string>(ClientTransactionLogsUrls.fetchLogs(this.baseURL), params, {
            responseType: 'text',
        });
    }

    public getLedgerMagicLink() {
        return this.http.get<string>(ClientTransactionLogsUrls.fetchLedgerMagicLink(this.baseURL));
    }
}
