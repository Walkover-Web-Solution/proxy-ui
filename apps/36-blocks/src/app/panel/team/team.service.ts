import { Inject, Injectable, inject } from '@angular/core';
import { BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable, shareReplay, tap } from 'rxjs';
import {
    ApiKey,
    CreateApiKeyRequest,
    InviteMemberRequest,
    OperatorRole,
    TEAM_PAGE_SIZE,
    TeamMember,
    UpdateApiKeyRequest,
    UpdateMemberRoleRequest,
} from './team.models';
import { TeamUrls } from './team.urls';

export type TeamResponse<T> = BaseResponse<T, void>;
export type TeamPage<T> = TeamResponse<IPaginatedResponse<T[]>>;

@Injectable({ providedIn: 'root' })
export class TeamService {
    private readonly http = inject(HttpWrapperService);
    private roles$?: Observable<TeamPage<OperatorRole>>;

    constructor(@Inject(ProxyBaseUrls.BaseURL) private readonly baseUrl: string) {}

    getMembers(params: { name?: string; pageNo: number }): Observable<TeamPage<TeamMember>> {
        const query: Record<string, string | number> = { pageNo: params.pageNo, itemsPerPage: TEAM_PAGE_SIZE };
        if (params.name?.trim()) query['name'] = params.name.trim();
        return this.http.get<TeamPage<TeamMember>>(TeamUrls.members(this.baseUrl), query);
    }

    inviteMember(body: InviteMemberRequest): Observable<TeamResponse<{ message: string }>> {
        return this.http.post<TeamResponse<{ message: string }>>(TeamUrls.invite(this.baseUrl), body);
    }

    updateMemberRole(body: UpdateMemberRoleRequest): Observable<TeamResponse<{ message: string }>> {
        return this.http.put<TeamResponse<{ message: string }>>(TeamUrls.updateMemberRole(this.baseUrl), body);
    }

    /**
     * Roles are global (not per workspace) and rarely change, so one request is shared by the tabs of a visit.
     * A failed request is not cached; pass `refresh` to force a new one (retry).
     */
    getRoles(refresh = false): Observable<TeamPage<OperatorRole>> {
        if (!this.roles$ || refresh) {
            const request$ = this.http
                .get<TeamPage<OperatorRole>>(TeamUrls.rolePermissions(this.baseUrl), { itemsPerPage: 100, pageNo: 1 })
                .pipe(
                    tap({
                        error: () => {
                            if (this.roles$ === request$) this.roles$ = undefined;
                        },
                    }),
                    shareReplay({ bufferSize: 1, refCount: false })
                );
            this.roles$ = request$;
        }
        return this.roles$;
    }

    getApiKeys(pageNo: number): Observable<TeamPage<ApiKey>> {
        return this.http.get<TeamPage<ApiKey>>(TeamUrls.apiKeys(this.baseUrl), {
            pageNo,
            itemsPerPage: TEAM_PAGE_SIZE,
        });
    }

    createApiKey(body: CreateApiKeyRequest): Observable<TeamResponse<ApiKey>> {
        return this.http.post<TeamResponse<ApiKey>>(TeamUrls.apiKeys(this.baseUrl), body);
    }

    updateApiKey(id: number, body: UpdateApiKeyRequest): Observable<TeamResponse<ApiKey>> {
        return this.http.put<TeamResponse<ApiKey>>(TeamUrls.apiKey(this.baseUrl, id), body);
    }

    deleteApiKey(id: number): Observable<TeamResponse<unknown>> {
        return this.http.delete<TeamResponse<unknown>>(TeamUrls.apiKey(this.baseUrl, id));
    }
}
