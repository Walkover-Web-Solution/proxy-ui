import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, IPaginatedResponse, IReqParams, ProxyBaseUrls } from '@proxy/models/root-models';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable } from 'rxjs';
import { IEnvironments, ILogDetailRes, ILogsReq, ILogsRes, IProjects } from '@proxy/models/logs-models';
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
    public getProxyLogs(params): Observable<BaseResponse<IPaginatedResponse<ILogsRes[]>, ILogsReq>> {
        return this.http.get<BaseResponse<IPaginatedResponse<ILogsRes[]>, ILogsReq>>(
            LogsUrls.getLogs(this.proxyLogsUrl),
            params
        );
    }

    // Fetch Proxy logs
    public getProxyLogsById(id: string): Observable<BaseResponse<ILogDetailRes, void>> {
        return this.http.get<BaseResponse<ILogDetailRes, void>>(
            LogsUrls.getLogsById(this.proxyLogsUrl).replace(':id', id)
        );
    }

    // Fetch Projects
    public getProjects(req: IReqParams): Observable<BaseResponse<IPaginatedResponse<IProjects[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IProjects[]>, void>>(
            LogsUrls.getProjects(this.proxyLogsUrl),
            req
        );
    }

    // Fetch Environments
    public getEnvironments(req: IReqParams): Observable<BaseResponse<IPaginatedResponse<IEnvironments[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IEnvironments[]>, void>>(
            LogsUrls.getEnvironment(this.proxyLogsUrl),
            req
        );
    }
}
