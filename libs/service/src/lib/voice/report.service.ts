import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { ISecurityUser } from '@msg91/models/setting-models';
import { map } from 'rxjs/operators';
import { VoiceLibServiceModule } from './voice.module';
import { VoiceReportsUrls } from '@msg91/urls/client-voice';
import { HttpWrapperService } from '@msg91/services/httpWrapper';

@Injectable({
    providedIn: VoiceLibServiceModule,
})
export class VoiceReportService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceBaseUrl: any,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any
    ) {}

    public getAllVoiceReportsService(request: any): Observable<BaseResponse<any, any>> {
        return this.http.get(VoiceReportsUrls.getAllVoiceReports(this.voiceBaseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<any, any> = res;
                data.request = request;
                return data;
            })
        );
    }

    public getCallRecordsService(request: number): Observable<BaseResponse<any, any>> {
        const option = {
            responseType: 'blob',
        };
        return this.http
            .get(VoiceReportsUrls.callRecords(this.voiceBaseUrl).replace(':id', request.toString()), {}, option)
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, any> = res;
                    data.request = request;
                    return data;
                })
            );
    }

    public GetColumn(): Observable<BaseResponse<string[], null>> {
        return this.http.get<BaseResponse<string[], null>>(VoiceReportsUrls.columnsFilter(this.voiceBaseUrl), {});
    }

    public updateColumns(param: { columns: string[] }): Observable<BaseResponse<any, { columns: string[] }>> {
        return this.http.post<BaseResponse<any, { columns: string[] }>>(
            VoiceReportsUrls.columnsFilter(this.voiceBaseUrl),
            param
        );
    }

    /**
     * Fetches the company agents
     *
     * @return {Observable<Array<ISecurityUser>>} Observable to carry out further operations
     * @memberof VoiceReportService
     */
    public getAgents(): Observable<BaseResponse<{ data: Array<ISecurityUser> }, void>> {
        return this.http.get<BaseResponse<{ data: Array<ISecurityUser> }, void>>(
            VoiceReportsUrls.getAgents(this.baseUrl),
            { itemsPerPage: 1000 }
        );
    }

    /**
     * Fetches the company teams
     *
     * @return {Observable<Array<any>>} Observable to carry out further operations
     * @memberof VoiceReportService
     */
    public getTeams(): Observable<BaseResponse<{ teams_list: Array<any> }, void>> {
        return this.http.get<BaseResponse<{ teams_list: Array<any> }, void>>(VoiceReportsUrls.getTeams(this.baseUrl), {
            page_size: 1000,
        });
    }
}
