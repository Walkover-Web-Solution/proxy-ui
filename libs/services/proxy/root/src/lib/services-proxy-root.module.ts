import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, IClientSettings, IClient, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable } from 'rxjs';
import { RootUrls } from '@proxy/urls/root-urls';
import { IProjects } from '@proxy/models/logs-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesProxyRootModule {}

@Injectable({
    providedIn: ServicesProxyRootModule,
})
export class RootService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any) {}

    // Fetch Client Settings
    public getClientSettings(): Observable<BaseResponse<IClientSettings, void>> {
        return this.http.get<BaseResponse<IClientSettings, void>>(RootUrls.getClientSettings(this.baseUrl));
    }

    // Switch Client
    public switchClient(body: { client_id: number }): Observable<BaseResponse<{ message: string }, void>> {
        return this.http.post<BaseResponse<{ message: string }, void>>(RootUrls.switchClient(this.baseUrl), body);
    }

    // Get All Clients
    public getClients(params: {
        [key: string]: string | number;
    }): Observable<BaseResponse<IPaginatedResponse<IClient[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IClient[]>, void>>(
            RootUrls.getClients(this.baseUrl),
            params
        );
    }

    public generateToken(params: { [key: string]: any } = {}): Observable<BaseResponse<{ jwt: string }, void>> {
        return this.http.get<BaseResponse<{ jwt: string }, void>>(RootUrls.generateToken(this.baseUrl), params);
    }
    public getProjects(): Observable<BaseResponse<IProjects, void>> {
        return this.http.get<BaseResponse<IProjects, void>>(RootUrls.getProject(this.baseUrl));
    }
}
