import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { FileUploadUrls } from '@msg91/urls/email/fileUpload';
import { IFileUploadReqModel } from '@msg91/models/email-models';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailFileUploadModule {}

@Injectable({
    providedIn: ServicesMsg91EmailFileUploadModule,
})
export class FileUploadService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any) {}

    public fileUpload(request: IFileUploadReqModel): Observable<BaseResponse<string, IFileUploadReqModel>> {
        const newPostRequest: FormData = new FormData();
        Object.keys(request).forEach((x) => {
            newPostRequest.append(x, request[x]);
        });
        return this.http.post<BaseResponse<string, IFileUploadReqModel>>(
            FileUploadUrls.fileUploadUrl(this.emailBaseUrl),
            newPostRequest
        );
    }
}
