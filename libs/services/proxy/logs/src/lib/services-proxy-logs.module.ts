import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable } from 'rxjs';
import { IEnvProjects, ILogsReq, ILogsRes } from '@proxy/models/logs-models';
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
    public getProxyLogsById(id: string): any {
        return this.http.get(LogsUrls.getLogsById(this.proxyLogsUrl).replace(':id', id));
    }

    // Fetch Projects
    public getEnvProjects(): Observable<BaseResponse<IPaginatedResponse<IEnvProjects[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IEnvProjects[]>, void>>(
            LogsUrls.getEnvProjects(this.proxyLogsUrl)
        );
    }
}
