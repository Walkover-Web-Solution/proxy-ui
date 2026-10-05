import { Inject, Injectable } from '@angular/core';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { BaseResponse, IPaginatedResponse, IReqParams, ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable } from 'rxjs';
import {
    IBlockScope,
    IBlockScopeCreatePayload,
    IBlockScopeUpdatePayload,
    IFeature,
    IFeatureDetails,
    IFeatureReq,
    IFeatureType,
    IMethod,
    IOAuthConfig,
    IOAuthConfigCreatePayload,
    IOAuthConfigUpdatePayload,
} from '@proxy/models/features-model';
import { FeaturesUrls } from '@proxy/urls/features-url';
@Injectable({
    providedIn: 'root',
})
export class FeaturesService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseURL: any
    ) {}

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

    // create lago feature
    public createLagoFeature(body): Observable<BaseResponse<IFeature, void>> {
        return this.http.post<BaseResponse<IFeature, void>>(FeaturesUrls.getLagoFeature(this.baseURL), body);
    }

    // get all billable metrics
    public getAllBillableMetrics(refId: string | number): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(FeaturesUrls.getBillableMetrics(this.baseURL, refId));
    }
    // create billable metric
    public createBillableMetric(body): Observable<BaseResponse<any, void>> {
        const refId = body.reference_id;
        return this.http.post<BaseResponse<any, void>>(FeaturesUrls.getBillableMetrics(this.baseURL, refId), body);
    }
    // update billable metric
    public updateBillableMetric(refId: string | number, code: string, body): Observable<BaseResponse<any, void>> {
        return this.http.put<BaseResponse<any, void>>(
            FeaturesUrls.updateBillableMetric(this.baseURL, refId, code),
            body
        );
    }
    // delete billable metric
    public deleteBillableMetric(refId: string | number, code: string): Observable<BaseResponse<any, void>> {
        return this.http.delete<BaseResponse<any, void>>(FeaturesUrls.deleteBillableMetric(this.baseURL, refId, code));
    }
    public getBillableMetricForm(): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(FeaturesUrls.getBillableMetricForm(this.baseURL));
    }
    // get plans form
    public getPlansForm(refId: string | number): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(FeaturesUrls.getPlansForm(this.baseURL, refId));
    }
    public getTaxes(refId: string | number): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(FeaturesUrls.getTaxes(this.baseURL, refId));
    }
    public createTax(refId: string | number, body): Observable<BaseResponse<any, void>> {
        return this.http.post<BaseResponse<any, void>>(FeaturesUrls.createTax(this.baseURL, refId), body);
    }
    // delete tax
    public deleteTax(refId: string | number, code: string): Observable<BaseResponse<any, void>> {
        return this.http.delete<BaseResponse<any, void>>(FeaturesUrls.deleteTax(this.baseURL, refId, code));
    }
    // create plan
    public createPlan(refId: string | number, body): Observable<BaseResponse<any, void>> {
        return this.http.post<BaseResponse<any, void>>(FeaturesUrls.createPlan(this.baseURL, refId), body);
    }
    //get all plans
    public getAllPlans(refId: string | number): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(FeaturesUrls.createPlan(this.baseURL, refId));
    }
    // update plan
    public updatePlan(refId: string | number, code: string, body): Observable<BaseResponse<any, void>> {
        return this.http.put<BaseResponse<any, void>>(FeaturesUrls.updatePlan(this.baseURL, refId, code), body);
    }
    // delete plan
    public deletePlan(refId: string | number, code: string): Observable<BaseResponse<any, void>> {
        return this.http.delete<BaseResponse<any, void>>(FeaturesUrls.deletePlan(this.baseURL, refId, code));
    }
    public getPaymentDetailsForm(): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(FeaturesUrls.getPaymentDetailsForm(this.baseURL));
    }
    public getPaymentDetailsFormById(refId: string | number): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(FeaturesUrls.getPaymentDetailsFormById(this.baseURL, refId));
    }
    public updatePaymentDetails(refId: string | number, body): Observable<BaseResponse<any, void>> {
        return this.http.post<BaseResponse<any, void>>(FeaturesUrls.updatePaymentDetails(this.baseURL, refId), body);
    }
    public getWebhookEvents(): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(FeaturesUrls.getWebhookEvents(this.baseURL));
    }

    public uploadLogo(id: string | number, formData: FormData): Observable<BaseResponse<any, void>> {
        return this.http.post<BaseResponse<any, void>>(FeaturesUrls.uploadLogo(this.baseURL, id), formData, {
            headers: {},
        });
    }

    public getAllowedOrigins(id: string | number): Observable<BaseResponse<any, void>> {
        return this.http.get<BaseResponse<any, void>>(FeaturesUrls.getAllowedOrigins(this.baseURL, id));
    }

    // ── OAuth configs ──
    public getOauthConfigs(
        featureId: string | number,
        params?: IReqParams
    ): Observable<BaseResponse<IPaginatedResponse<IOAuthConfig[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IOAuthConfig[]>, void>>(
            FeaturesUrls.oauthConfigs(this.baseURL, featureId),
            params
        );
    }

    public getOauthConfig(
        featureId: string | number,
        oauthConfigId: string | number
    ): Observable<BaseResponse<IOAuthConfig, void>> {
        return this.http.get<BaseResponse<IOAuthConfig, void>>(
            FeaturesUrls.oauthConfig(this.baseURL, featureId, oauthConfigId)
        );
    }

    public createOauthConfig(
        featureId: string | number,
        body: IOAuthConfigCreatePayload
    ): Observable<BaseResponse<IOAuthConfig, void>> {
        return this.http.post<BaseResponse<IOAuthConfig, void>>(
            FeaturesUrls.oauthConfigs(this.baseURL, featureId),
            body
        );
    }

    public updateOauthConfig(
        featureId: string | number,
        oauthConfigId: string | number,
        body: IOAuthConfigUpdatePayload
    ): Observable<BaseResponse<IOAuthConfig, void>> {
        return this.http.put<BaseResponse<IOAuthConfig, void>>(
            FeaturesUrls.oauthConfig(this.baseURL, featureId, oauthConfigId),
            body
        );
    }

    public deleteOauthConfig(
        featureId: string | number,
        oauthConfigId: string | number
    ): Observable<BaseResponse<any, void>> {
        return this.http.delete<BaseResponse<any, void>>(
            FeaturesUrls.oauthConfig(this.baseURL, featureId, oauthConfigId)
        );
    }

    public regenerateOauthSecret(
        featureId: string | number,
        oauthConfigId: string | number
    ): Observable<BaseResponse<IOAuthConfig, void>> {
        return this.http.post<BaseResponse<IOAuthConfig, void>>(
            FeaturesUrls.regenerateOauthSecret(this.baseURL, featureId, oauthConfigId),
            {}
        );
    }

    public disableOauthConfig(
        featureId: string | number,
        oauthConfigId: string | number
    ): Observable<BaseResponse<IOAuthConfig, void>> {
        return this.http.post<BaseResponse<IOAuthConfig, void>>(
            FeaturesUrls.disableOauthConfig(this.baseURL, featureId, oauthConfigId),
            {}
        );
    }

    // ── Block scopes ──
    public getBlockScopes(
        featureId: string | number,
        params?: IReqParams
    ): Observable<BaseResponse<IPaginatedResponse<IBlockScope[]>, void>> {
        return this.http.get<BaseResponse<IPaginatedResponse<IBlockScope[]>, void>>(
            FeaturesUrls.blockScopes(this.baseURL, featureId),
            params
        );
    }

    public createBlockScope(
        featureId: string | number,
        body: IBlockScopeCreatePayload
    ): Observable<BaseResponse<IBlockScope, void>> {
        return this.http.post<BaseResponse<IBlockScope, void>>(FeaturesUrls.blockScopes(this.baseURL, featureId), body);
    }

    public updateBlockScope(
        featureId: string | number,
        blockScopeId: string | number,
        body: IBlockScopeUpdatePayload
    ): Observable<BaseResponse<IBlockScope, void>> {
        return this.http.put<BaseResponse<IBlockScope, void>>(
            FeaturesUrls.blockScope(this.baseURL, featureId, blockScopeId),
            body
        );
    }

    public deleteBlockScope(
        featureId: string | number,
        blockScopeId: string | number
    ): Observable<BaseResponse<any, void>> {
        return this.http.delete<BaseResponse<any, void>>(
            FeaturesUrls.blockScope(this.baseURL, featureId, blockScopeId)
        );
    }
}
