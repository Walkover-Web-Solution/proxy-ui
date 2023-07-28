import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseResponse, IToken, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IAdminVoiceFileRequestModel,
    IAdminVoiceFilesResponseModel,
    IPaginatedVoiceResponse,
} from '@msg91/models/voice-models';
import { map } from 'rxjs/operators';
import { AdminVoiceFileUrls } from 'libs/service/src/lib/utils/admin/voice/file';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesAdminAuthModule, ServicesHttpWrapperModule],
})
export class ServicesAdminVoiceFileModule {}
@Injectable({
    providedIn: ServicesAdminVoiceFileModule,
})
export class AdminVoiceFileService {
    public options = {
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json',
            Authorization: '',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.VoiceBaseURL) private voiceBaseUrl: any,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private authService: AuthService
    ) {}

    public getAllFiles(
        request: IAdminVoiceFileRequestModel
    ): Observable<BaseResponse<IPaginatedVoiceResponse<IAdminVoiceFilesResponseModel[]>, IAdminVoiceFileRequestModel>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const newParam = {
            ...request,
            company_id: this.token.companyId ? this.token.companyId : '',
        };
        return this.http.get<
            BaseResponse<IPaginatedVoiceResponse<IAdminVoiceFilesResponseModel[]>, IAdminVoiceFileRequestModel>
        >(AdminVoiceFileUrls.getAllFiles(this.voiceBaseUrl), newParam, this.options);
    }

    public getFileVoice(request: { fileId: number; versionId: number }): Observable<BaseResponse<any, any>> {
        const option = {
            responseType: 'blob',
            headers: {
                Authorization: this.authService.getTokenSync(),
            },
            withCredentials: false,
        };
        const newParam = {
            company_id: this.token.companyId ? this.token.companyId : '',
        };
        return this.http
            .get(
                AdminVoiceFileUrls.getFileVoice(this.voiceBaseUrl)
                    .replace(':fileId', request.fileId.toString())
                    .replace(':versionId', request.versionId.toString()),
                {},
                option
            )
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, any> = res;
                    data.request = request;
                    return data;
                })
            );
    }

    public updateVersionStatus(
        request: any,
        fileId: number,
        versionId: number,
        reasonId: number
    ): Observable<BaseResponse<any, any>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        const requestObj = request;
        if (reasonId) {
            requestObj['reason_id'] = reasonId;
        }
        return this.http.put<BaseResponse<any, any>>(
            AdminVoiceFileUrls.updateFileStatus(this.voiceBaseUrl)
                .replace(':fileId', fileId.toString())
                .replace(':versionId', versionId.toString()),
            requestObj,
            this.options
        );
    }

    /**
     * Fetches rejection reasons
     *
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof AdminVoiceFileService
     */
    public fetchRejectionReasons(data: { title?: string }): Observable<BaseResponse<any, void>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<BaseResponse<any, void>>(
            AdminVoiceFileUrls.fetchRejectionReasons(this.voiceBaseUrl),
            data?.title ? data : {},
            this.options
        );
    }

    /**
     * Adds a new rejection reason
     *
     * @param {{ title: string; content: string }} request Rejection reason details
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof AdminVoiceFileService
     */
    public addRejectionReason(request: {
        title: string;
        content: string;
    }): Observable<BaseResponse<any, { title: string; content: string }>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.post<BaseResponse<any, { title: string; content: string }>>(
            AdminVoiceFileUrls.fetchRejectionReasons(this.voiceBaseUrl),
            request,
            this.options
        );
    }

    /**
     * Deletes a rejection reason
     *
     * @param {number} reasonId Reason ID
     * @return {Observable<BaseResponse<any, any>>} Observable to carry out further operations
     * @memberof AdminVoiceFileService
     */
    public deleteRejectionReason(reasonId: number): Observable<BaseResponse<any, number>> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.delete<BaseResponse<any, number>>(
            AdminVoiceFileUrls.deleteRejectionReason(this.voiceBaseUrl).replace(':reasonId', String(reasonId)),
            {},
            this.options
        );
    }
}
