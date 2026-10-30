import { Inject, Injectable, inject } from '@angular/core';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { createUrl } from '@proxy/service';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable } from 'rxjs';
import { ActivityOperation } from './activity.models';

export type ActivityResponse = BaseResponse<IPaginatedResponse<ActivityOperation[]>, void>;

export interface LoginAsRequest {
    user_id: number;
    company_id?: number;
    reason: string;
}

export interface LoginAsResult {
    redirect_url?: string;
    proxy_auth_token?: string;
    refresh_token?: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
    private readonly http = inject(HttpWrapperService);

    constructor(@Inject(ProxyBaseUrls.BaseURL) private readonly baseUrl: string) {}

    getOperations(params: Record<string, string | number>): Observable<ActivityResponse> {
        return this.http.get<ActivityResponse>(createUrl(this.baseUrl, 'operations'), params);
    }

    loginAs(request: LoginAsRequest): Observable<BaseResponse<LoginAsResult, void>> {
        return this.http.post<BaseResponse<LoginAsResult, void>>(createUrl(this.baseUrl, 'loginAs'), request);
    }
}
