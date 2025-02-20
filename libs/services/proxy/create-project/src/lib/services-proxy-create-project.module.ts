import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { BaseResponse, IPaginatedResponse, IReqParams, ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable } from 'rxjs';
import { CreatProjectUrl } from '@proxy/urls/create-project-urls';
import { IEnvironments, IProjects } from '@proxy/models/logs-models';
import { ICreateSource } from '@proxy/models/project-model';
import { IClientData } from '@proxy/models/users-model';

@NgModule({
    imports: [CommonModule],
})
export class ServicesProxyCreateProjectModule {}

@Injectable({
    providedIn: ServicesProxyCreateProjectModule,
})
export class CreateProjectService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseURL: any) {}

    public createProject(body): Observable<BaseResponse<IProjects[], void>> {
        return this.http.post<BaseResponse<IProjects[], void>>(CreatProjectUrl.createProject(this.baseURL), body);
    }
    public getEnvironments(req: IReqParams): Observable<BaseResponse<IPaginatedResponse<IEnvironments[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IEnvironments[]>, void>>(
            CreatProjectUrl.getEnvironment(this.baseURL),
            req
        );
    }
    public getClientData(req: IReqParams): Observable<BaseResponse<IPaginatedResponse<IClientData[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IClientData[]>, void>>(
            CreatProjectUrl.getClient(this.baseURL),
            req
        );
    }
    public createSource(body: ICreateSource): Observable<ICreateSource> {
        return this.http.post<BaseResponse<ICreateSource[], void>>(CreatProjectUrl.createSource(this.baseURL), body);
    }
    public updateProject(id: string | number, body): Observable<BaseResponse<IProjects[], void>> {
        return this.http.put<BaseResponse<IProjects[], void>>(
            `${CreatProjectUrl.updateProject(this.baseURL)}/${id}`,
            body
        );
    }
}
