import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, IClientSettings, ICompany, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable } from 'rxjs';
import { RootUrls } from '@proxy/urls/root-urls';

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
    public switchClient(body: { company_id: number }): Observable<BaseResponse<{ message: string }, void>> {
        return this.http.post<BaseResponse<{ message: string }, void>>(RootUrls.switchClient(this.baseUrl), body);
    }

    // Get All Clients
    public getClients(params: {
        [key: string]: string;
    }): Observable<BaseResponse<IPaginatedResponse<ICompany[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<ICompany[]>, void>>(
            RootUrls.getClients(this.baseUrl),
            params
        );
    }
}
