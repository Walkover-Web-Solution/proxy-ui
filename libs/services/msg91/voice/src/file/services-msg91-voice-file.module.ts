import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IFileResponseModel,
    IRecordFileFromPhoneReqModel,
    IRecordFileVersionFromPhoneReqModel,
    ISpeechToTextResponseModel,
    ITextToSpeechResponseModel,
    IVersion,
} from '@msg91/models/voice-models';
import { IPaginationVoiceResponse } from '@msg91/models/voice-models';
import { map } from 'rxjs/operators';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { FilesReportsUrls } from '@msg91/urls/client-voice';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91VoiceFileModule {}

@Injectable({
    providedIn: ServicesMsg91VoiceFileModule,
})
export class VoiceFileService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.VoiceBaseURL) private baseUrl: any) {}

    public getFiles(request: any): Observable<BaseResponse<IPaginationVoiceResponse<IFileResponseModel[]>, any>> {
        return this.http.get(FilesReportsUrls.files(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<IPaginationVoiceResponse<IFileResponseModel[]>, any> = res;
                data.request = request;
                return data;
            })
        );
    }

    public addFile(request: any): Observable<BaseResponse<IFileResponseModel, any>> {
        return this.http.post(FilesReportsUrls.files(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<IFileResponseModel, any> = res;
                data.request = request;
                return data;
            })
        );
    }

    public addVersion(request: any, fileId: number): Observable<BaseResponse<IVersion, any>> {
        return this.http
            .post(FilesReportsUrls.createFileVersions(this.baseUrl).replace(':fileId', fileId.toString()), request)
            .pipe(
                map((res) => {
                    const data: BaseResponse<IVersion, any> = res;
                    data.request = request;
                    return data;
                })
            );
    }

    public getFileVoice(request: { fileId: number; versionId: number }): Observable<BaseResponse<any, any>> {
        const option = {
            responseType: 'blob',
        };
        return this.http
            .get(
                FilesReportsUrls.getFileVoice(this.baseUrl)
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

    public deleteVersion(fileId: number, versionId: number): Observable<BaseResponse<string, any>> {
        return this.http.delete<BaseResponse<string, any>>(
            FilesReportsUrls.fileVersion(this.baseUrl)
                .replace(':fileId', fileId.toString())
                .replace(':versionId', versionId.toString())
        );
    }

    public activeVersion(request: any, fileId: number, versionId: number): Observable<BaseResponse<any, any>> {
        return this.http.put<BaseResponse<any, any>>(
            FilesReportsUrls.fileVersion(this.baseUrl)
                .replace(':fileId', fileId.toString())
                .replace(':versionId', versionId.toString()),
            request
        );
    }

    public getTtsLanguages(): Observable<BaseResponse<ITextToSpeechResponseModel[], any>> {
        return this.http.get<BaseResponse<ITextToSpeechResponseModel[], any>>(
            FilesReportsUrls.getTtsLanguages(this.baseUrl)
        );
    }

    public getSttLanguages(): Observable<BaseResponse<ISpeechToTextResponseModel[], any>> {
        return this.http.get<BaseResponse<ISpeechToTextResponseModel[], any>>(
            FilesReportsUrls.getSttLanguages(this.baseUrl)
        );
    }

    public textToSpeechOnBrowser(req: any): Observable<BaseResponse<any, any>> {
        const option = {
            responseType: 'blob',
        };
        return this.http.post<BaseResponse<any, any>>(
            FilesReportsUrls.textToSpeechOnBrowser(this.baseUrl),
            req,
            option
        );
    }

    public recordFileFromPhone(
        req: IRecordFileFromPhoneReqModel
    ): Observable<BaseResponse<any, IRecordFileFromPhoneReqModel>> {
        return this.http.post<BaseResponse<any, IRecordFileFromPhoneReqModel>>(
            FilesReportsUrls.files(this.baseUrl),
            req
        );
    }

    public recordFileVersionFromPhone(
        req: IRecordFileVersionFromPhoneReqModel,
        fileId: number
    ): Observable<BaseResponse<IRecordFileVersionFromPhoneReqModel, number>> {
        return this.http.post<BaseResponse<IRecordFileVersionFromPhoneReqModel, number>>(
            FilesReportsUrls.recordFileVersionFromPhone(this.baseUrl).replace(':fileId', fileId.toString()),
            req
        );
    }
}
