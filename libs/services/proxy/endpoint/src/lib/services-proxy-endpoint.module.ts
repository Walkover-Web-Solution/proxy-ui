import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { BaseResponse, IPaginatedResponse, IReqParams, ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable } from 'rxjs';
import { IEnvironments, IProjects } from '@proxy/models/logs-models';
import { EndpointUrl } from '@proxy/urls/endpoint-urls';

@NgModule({
    imports: [CommonModule],
})
export class ServicesProxyEndpointModule {}

@Injectable({
    providedIn: ServicesProxyEndpointModule,
})
export class EndpointService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseURL: any) {}
    public getEnvProject(req: IReqParams): Observable<BaseResponse<IPaginatedResponse<IEnvironments[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IEnvironments[]>, void>>(
            EndpointUrl.getEnvProject(this.baseURL),
            req
        );
    }
    public getEndpointData(id: string | number): Observable<BaseResponse<IProjects[], void>> {
        return this.http.get<BaseResponse<IProjects[], void>>(
            `${EndpointUrl.projectUrl(this.baseURL)}/${id}/endpoints`
        );
    }
    public deleteEndpoint(projectId: string | number, id: string | number): Observable<any> {
        return this.http.delete<any>(`${EndpointUrl.projectUrl(this.baseURL)}/${projectId}/endpoints/${id}`);
    }
    public createEndpoint(id: string | number, body): Observable<BaseResponse<IProjects[], void>> {
        return this.http.post<any>(`${EndpointUrl.projectUrl(this.baseURL)}/${id}/endpoints`, body);
    }
    public getSingleEndpont(
        projecyId: string | number,
        endPointId: string | number
    ): Observable<BaseResponse<any, void>> {
        return this.http.get<any>(`${EndpointUrl.projectUrl(this.baseURL)}/${projecyId}/endpoints/${endPointId}`);
    }
    public updateEndpoint(
        projectId: string | number,
        endPointId: string | number,
        body
    ): Observable<BaseResponse<IProjects[], void>> {
        return this.http.put<any>(`${EndpointUrl.projectUrl(this.baseURL)}/${projectId}/endpoints/${endPointId}`, body);
    }

    public verficationIntegration(body): Observable<BaseResponse<any, void>> {
        return this.http.post<any>(`${EndpointUrl.verficationIntegration(this.baseURL)}`, body);
    }
}
