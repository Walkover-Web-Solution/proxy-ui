import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable } from 'rxjs';
import { IFeature, IFeatureDetails, IFeatureReq, IFeatureType, IMethod } from '@proxy/models/features-model';
import { FeaturesUrls } from '@proxy/urls/features-url';

@NgModule({
    imports: [CommonModule],
})
export class ServicesProxyFeaturesModule {}

@Injectable({
    providedIn: ServicesProxyFeaturesModule,
})
export class FeaturesService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseURL: any) {}

    // Fetch All Feature
    public getFeature(params): Observable<BaseResponse<IPaginatedResponse<IFeature[]>, IFeatureReq>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IFeature[]>, IFeatureReq>>(
            FeaturesUrls.getFeature(this.baseURL),
            params
        );
    }

    // Get Feature Details
    public getFeatureDetails(id: string | number): Observable<BaseResponse<IFeatureDetails, void>> {
        return this.http.get<BaseResponse<IFeatureDetails, void>>(`${FeaturesUrls.getFeature(this.baseURL)}/${id}`);
    }

    // Fetch Feature Type
    public getFeatureType(): Observable<BaseResponse<IFeatureType[], void>> {
        return this.http.get<BaseResponse<IFeatureType[], void>>(FeaturesUrls.getFeatureType(this.baseURL));
    }

    // Fetch Method Service
    public getMethodService(id: number): Observable<BaseResponse<IMethod[], void>> {
        return this.http.get<BaseResponse<IMethod[], void>>(
            FeaturesUrls.getMethodService(this.baseURL).replace(':id', String(id))
        );
    }

    // Create Feature
    public createFeature(body): Observable<BaseResponse<IFeature, void>> {
        return this.http.post<BaseResponse<IFeature, void>>(FeaturesUrls.getFeature(this.baseURL), body);
    }

    // Update Feature
    public updateFeature(id: string | number, body): Observable<BaseResponse<IFeature, void>> {
        return this.http.put<BaseResponse<IFeature, void>>(`${FeaturesUrls.getFeature(this.baseURL)}/${id}`, body);
    }
    public createproject(body): Observable<BaseResponse<IFeature, void>> {
        return this.http.post<BaseResponse<IFeature, void>>(FeaturesUrls.createproject(this.baseURL), body);
    }
}
