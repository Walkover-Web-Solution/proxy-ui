import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { AuthService } from '@proxy/services/proxy/auth';
import { IEnvProjects, ILogsData } from '@proxy/models/logs-models';
import { LogsUrls } from '@proxy/urls/logs-urls';

@NgModule({
    imports: [CommonModule],
})
export class ServicesProxyLogsModule {}

@Injectable({
    providedIn: ServicesProxyLogsModule
})
export class LogsService {

    constructor(
        private http: HttpWrapperService,
        private authService: AuthService, 
        @Inject(ProxyBaseUrls.ProxyLogsUrl) private proxyLogsUrl: any
    ){
    }

    // Fetch Proxy logs
    public getProxyLogs(params): Observable<BaseResponse<IPaginatedResponse<ILogsData[]>, void>> {
        // this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<IPaginatedResponse<ILogsData[]>, void>>(LogsUrls.getLogs(this.proxyLogsUrl),params)
    }

    // Fetch Projects
    public getEnvProjects(): Observable<BaseResponse<IPaginatedResponse<IEnvProjects[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IEnvProjects[]>, void>>(LogsUrls.getEnvProjects(this.proxyLogsUrl))
    } 
}