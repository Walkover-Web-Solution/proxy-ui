import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { BaseResponse, IPaginatedResponse, IReqParams, ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable } from 'rxjs';
import { IEnvironments, IProjects } from '@proxy/models/logs-models';
import { EndpointUrl } from '@proxy/urls/endpoint-urls';
import { IEndpointsRes, IEnvProject } from '@proxy/models/endpoint';

@NgModule({
    imports: [CommonModule],
})
export class ServicesProxyEndpointModule {}

@Injectable({
    providedIn: ServicesProxyEndpointModule,
})
export class EndpointService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseURL: any) {}
    public getEnvProject(req: IReqParams): Observable<BaseResponse<IPaginatedResponse<IEnvProject[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IEnvProject[]>, void>>(
            EndpointUrl.getEnvProject(this.baseURL),
            req
        );
    }
    public getEndpointData(id: string | number): Observable<BaseResponse<IPaginatedResponse<IEndpointsRes[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IEndpointsRes[]>, void>>(
            `${EndpointUrl.getEndpoint(this.baseURL)}${id}/projectEndpoints`
        );
    }
    public deleteEndpoint(projectId: string | number, id: string | number): Observable<any> {
        return this.http.delete<Observable<any>>(
            `${EndpointUrl.projectUrl(this.baseURL)}/${projectId}/endpoints/${id}`
        );
    }
    public createEndpoint(
        id: string | number,
        body
    ): Observable<BaseResponse<IPaginatedResponse<IEndpointsRes[]>, void>> {
        return this.http.post<BaseResponse<IPaginatedResponse<IEndpointsRes[]>, void>>(
            `${EndpointUrl.projectUrl(this.baseURL)}/${id}/endpoints`,
            body
        );
    }
    public getSingleEndpont(
        projecyId: string | number,
        endPointId: string | number
    ): Observable<BaseResponse<IPaginatedResponse<IEndpointsRes[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IEndpointsRes[]>, void>>(
            `${EndpointUrl.projectUrl(this.baseURL)}/${projecyId}/endpoints/${endPointId}`
        );
    }
    public updateEndpoint(
        projectId: string | number,
        endPointId: string | number,
        body
    ): Observable<BaseResponse<IPaginatedResponse<IEndpointsRes[]>, void>> {
        return this.http.put<BaseResponse<IPaginatedResponse<IEndpointsRes[]>, void>>(
            `${EndpointUrl.projectUrl(this.baseURL)}/${projectId}/endpoints/${endPointId}`,
            body
        );
    }

    public verficationIntegration(body): Observable<BaseResponse<IPaginatedResponse<IProjects[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IProjects[]>, void>>(
            `${EndpointUrl.verficationIntegration(this.baseURL)}`
        );
    }
    public createPolicy(body): Observable<BaseResponse<IPaginatedResponse<IEndpointsRes[]>, void>> {
        return this.http.post<BaseResponse<IPaginatedResponse<IEndpointsRes[]>, void>>(
            `${EndpointUrl.createPolicy(this.baseURL)}`,
            body
        );
    }
}
