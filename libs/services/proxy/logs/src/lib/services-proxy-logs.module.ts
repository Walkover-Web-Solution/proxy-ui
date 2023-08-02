import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable } from 'rxjs';
import { AuthService } from '@proxy/services/proxy/auth';
import { ILogsData } from '@proxy/models/logs-models';
import { LogsUrls } from '@proxy/urls/logs-urls';

@NgModule({
    imports: [CommonModule],
})
export class ServicesProxyLogsModule {}

@Injectable({
    providedIn: ServicesProxyLogsModule
})
export class LogsService {
    public options = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': '',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        private authService: AuthService, 
        @Inject(ProxyBaseUrls.ProxyLogsUrl) private proxyLogsUrl: any
    ){}

    // Fetch Proxy logs
    public getProxyLogs(params): Observable<BaseResponse<IPaginatedResponse<ILogsData[]>, void>> {
        // this.options.headers.Authorization = this.authService.getTokenSync();
        this.options.headers.Authorization = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImlkIjo4LCJjcmVhdGVkX2F0IjoiMjAyMy0wOC0wMVQxMjo0MjozOS4wMDAwMDBaIn19.XM_euueDSSuQbuzFG22t7hLSWKLAeTol4XFoGGJDeWc';
        console.log('Op', this.options)
        return this.http.get<BaseResponse<IPaginatedResponse<ILogsData[]>, void>>(LogsUrls.getLogs(this.proxyLogsUrl),params, this.options)
    }
}