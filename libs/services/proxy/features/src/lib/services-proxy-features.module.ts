import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable } from 'rxjs';
import { IFeature, IFeatureReq, IFeatureType, IMethod } from '@proxy/models/features-model';
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

    // Fetch Feature Type
    public getFeatureType(): Observable<BaseResponse<IFeatureType[], void>> {
        return this.http.get(FeaturesUrls.getFeatureType(this.baseURL));
    }

    // Fetch Method
    public getMethod(id): Observable<BaseResponse<IMethod[], void>> {
        return this.http.get<BaseResponse<IMethod[], void>>(FeaturesUrls.getMethod(this.baseURL).replace(':id', id));
    }
}
