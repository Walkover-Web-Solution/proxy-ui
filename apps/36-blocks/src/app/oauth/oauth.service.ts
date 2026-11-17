import { Inject, Injectable, inject } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable } from 'rxjs';
import { AuthorizeParams, buildAuthorizeQuery, buildDecisionRequest } from './oauth-consent';
import { OAuthAuthorizeData, OAuthConnection, OAuthDecisionAction, OAuthDecisionData } from './oauth.models';
import { OAuthUrls } from './oauth.urls';

/**
 * Calls the operator OAuth endpoints with the operator's session (raw `Authorization` header, set by the shared HTTP
 * wrapper). Responses are never logged or cached: the decision response carries an authorization code.
 */
@Injectable({ providedIn: 'root' })
export class OAuthService {
    private readonly http = inject(HttpWrapperService);

    constructor(@Inject(ProxyBaseUrls.BaseURL) private readonly baseUrl: string) {}

    /** Validates the request on the server and returns what the consent page shows. */
    authorize(params: AuthorizeParams): Observable<BaseResponse<OAuthAuthorizeData, void>> {
        return this.http.get<BaseResponse<OAuthAuthorizeData, void>>(
            OAuthUrls.authorize(this.baseUrl),
            buildAuthorizeQuery(params)
        );
    }

    decide(params: AuthorizeParams, action: OAuthDecisionAction): Observable<BaseResponse<OAuthDecisionData, void>> {
        return this.http.post<BaseResponse<OAuthDecisionData, void>>(
            OAuthUrls.decision(this.baseUrl),
            buildDecisionRequest(params, action)
        );
    }

    getConnections(): Observable<BaseResponse<OAuthConnection[], void>> {
        return this.http.get<BaseResponse<OAuthConnection[], void>>(OAuthUrls.connections(this.baseUrl));
    }

    revokeConnection(id: number | string): Observable<BaseResponse<{ revoked: boolean }, void>> {
        return this.http.post<BaseResponse<{ revoked: boolean }, void>>(
            OAuthUrls.revokeConnection(this.baseUrl, id),
            {}
        );
    }
}
