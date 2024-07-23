import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { BaseResponse, IPaginatedResponse, IReqParams, ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable } from 'rxjs';
import { CreatProjectUrl } from '@proxy/urls/create-project-urls';
import { IEnvironments, IProjects } from '@proxy/models/logs-models';

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
        return this.http.post(CreatProjectUrl.createProject(this.baseURL), body);
    }
    public getEnvironments(req: IReqParams): Observable<BaseResponse<IPaginatedResponse<IEnvironments[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IEnvironments[]>, void>>(
            CreatProjectUrl.getEnvironment(this.baseURL),
            req
        );
    }
    public createSource(body): Observable<any> {
        return this.http.post(CreatProjectUrl.createSource(this.baseURL), body);
    }
    public updateProject(id: string | number, body): Observable<BaseResponse<IProjects[], void>> {
        return this.http.put<any>(`${CreatProjectUrl.updateProject(this.baseURL)}/${id}`, body);
    }
}
