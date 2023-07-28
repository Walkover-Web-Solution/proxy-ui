import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { BaseResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import { AdminHelloUrls } from 'libs/service/src/lib/utils/admin/hello/hello-urls';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import {
    IClient,
    IClientReq,
    ICount,
    IHelloDashboardData,
    IHelloDashboardGraph,
    IHelloReportGraph,
} from '@msg91/models/hello-models';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminHelloModule {}

@Injectable({
    providedIn: ServicesAdminHelloModule,
})
export class AdminHelloService {
    public options = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': '',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.HelloProxy) private helloBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getClientsService(param: string): Observable<{ clients: IClient[]; count: number }> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<{ clients: IClient[]; count: number }>(
            AdminHelloUrls.getClient(this.helloBaseUrl, param),
            '',
            this.options
        );
    }

    public authentication(): Observable<boolean> {
        return this.authService.getToken().pipe(
            exhaustMap((token) => {
                this.options.headers.Authorization = token;
                return this.http
                    .get<{ clients: IClient[]; count: number }>(
                        AdminHelloUrls.authentication(this.helloBaseUrl),
                        '',
                        this.options
                    )
                    .pipe(
                        map((res) => {
                            const data: { clients: IClient[]; count: number } = res;
                            return true;
                        }),
                        catchError((error) => {
                            return of(false);
                        })
                    );
            })
        );
    }

    public getClient(id: number): Observable<IClient> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<IClient>(AdminHelloUrls.getClientWithId(this.helloBaseUrl, id), '', this.options);
    }

    public updateClientsService(payload: IClientReq, id: number): Observable<BaseResponse<IClient, null>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.put<BaseResponse<IClient, null>>(
            AdminHelloUrls.updateClient(this.helloBaseUrl, id),
            payload,
            this.options
        );
    }

    public getCountsService(
        param: string
    ): Observable<{ clients: ICount[]; clients_count: number } | IHelloDashboardData> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<{ clients: ICount[]; clients_count: number } | IHelloDashboardData>(
            AdminHelloUrls.getCount(this.helloBaseUrl, param),
            '',
            this.options
        );
    }

    public getCount(id: number): Observable<ICount> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<ICount>(AdminHelloUrls.getCountWithId(this.helloBaseUrl, id), '', this.options);
    }

    public getDashboardDataService(param: string): Observable<IHelloDashboardData> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<IHelloDashboardData>(AdminHelloUrls.getClient(this.helloBaseUrl, param), '', this.options);
    }

    public getDashboardGraphService(param: string, id: number = null): Observable<IHelloDashboardGraph> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<IHelloDashboardGraph>(
            AdminHelloUrls.getDashboard(this.helloBaseUrl, param, id),
            '',
            this.options
        );
    }

    public getReportGraphService(param: any): Observable<IHelloReportGraph> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = { ...param, comp_id: this.token.companyId ? this.token.companyId : '' };
        return this.http.get<IHelloReportGraph>(
            AdminHelloUrls.getReportGraph(this.helloBaseUrl),
            newParam,
            this.options
        );
    }
}
