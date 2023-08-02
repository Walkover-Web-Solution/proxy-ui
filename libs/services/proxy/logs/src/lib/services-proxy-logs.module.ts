import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable } from 'rxjs';
import { ILogsData } from '@proxy/models/logs-models';
import { LogsUrls } from '@proxy/urls/logs-urls';

@NgModule({
    imports: [CommonModule],
})
export class ServicesProxyLogsModule {}

@Injectable({
    providedIn: ServicesProxyLogsModule,
})
export class LogsService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.ProxyLogsUrl) private proxyLogsUrl: any) {}

    // Fetch Proxy logs
    public getProxyLogs(params): Observable<BaseResponse<IPaginatedResponse<ILogsData[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<ILogsData[]>, void>>(
            LogsUrls.getLogs(this.proxyLogsUrl),
            params
        );
    }
}
