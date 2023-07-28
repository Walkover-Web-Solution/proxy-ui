import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MicroserviceBaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { FilesOrFolder, FilesOrFolderResponse, GeneratedSignedUrlResModel } from '@msg91/models/files-models';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AllFilesUrls } from '@msg91/urls/file';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91FilesModule {}

@Injectable({
    providedIn: ServicesMsg91FilesModule,
})
export class AllFilesService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.FileUploadProxy) private fileBaseUrl: string) {}

    public getAllFilesService(
        request: any,
        parentId: string
    ): Observable<MicroserviceBaseResponse<FilesOrFolderResponse, any>> {
        return this.http.get(AllFilesUrls.folderFileAndFolder(this.fileBaseUrl).replace(':id', parentId), request);
    }

    public fileUploadService(
        request: any,
        parentId: string = '0'
    ): Observable<MicroserviceBaseResponse<FilesOrFolder, any>> {
        const newHeader = {
            headers: {
                noHeader: true,
            },
        };
        const url =
            request.get('type') === 'file'
                ? AllFilesUrls.uploadFile(this.fileBaseUrl)
                : AllFilesUrls.createFolders(this.fileBaseUrl);
        return this.http.post(url.replace(':parentId', parentId), request, newHeader).pipe(
            map((res) => {
                const data: any = res;
                data.request = {
                    type: request.get('type'),
                    parentId: request.get('parentId'),
                    name: request.get('name'),
                };
                return data;
            })
        );
    }

    public updateFileOrFolder(request: any, id: number): Observable<MicroserviceBaseResponse<FilesOrFolder, any>> {
        const newHeader = {
            ...(request.get('type') === 'file' && {
                headers: {
                    noHeader: true,
                },
            }),
        };
        const url =
            request.get('type') === 'file'
                ? AllFilesUrls.file(this.fileBaseUrl)
                : AllFilesUrls.folder(this.fileBaseUrl);
        return this.http.post(url.replace(':id', id.toString()), request, newHeader);
    }

    public getFileOrFolder(fileOrFolderId: number): Observable<MicroserviceBaseResponse<FilesOrFolder, any>> {
        return this.http.get(AllFilesUrls.folder(this.fileBaseUrl).replace(':id', fileOrFolderId.toString()));
    }

    public deleteFileOrFolder(
        fileOrFolderId: number,
        fileOrFolderStr: string
    ): Observable<MicroserviceBaseResponse<FilesOrFolder, any>> {
        const url =
            fileOrFolderStr === 'file' ? AllFilesUrls.file(this.fileBaseUrl) : AllFilesUrls.folder(this.fileBaseUrl);
        return this.http.delete(url.replace(':id', fileOrFolderId.toString())).pipe(
            map((res) => {
                const data: any = res;
                data.request = fileOrFolderId;
                return data;
            })
        );
    }

    public generateSignedUrl(
        param: any,
        parentId: string,
        fileId: string
    ): Observable<MicroserviceBaseResponse<GeneratedSignedUrlResModel, any>> {
        const url = fileId
            ? AllFilesUrls.generateSignedUrlForUpdate(this.fileBaseUrl).replace(':id', fileId)
            : AllFilesUrls.generateSignedUrl(this.fileBaseUrl).replace(':id', parentId);
        const formData = new FormData();
        formData.append('contentType', param.file.type);
        return this.http.post(url, formData).pipe(
            map((res) => {
                let data = res;
                data.name = param.name;
                return data;
            }),
            catchError((err) => {
                return throwError({
                    ...err,
                    name: param.name,
                });
            })
        );
    }

    public saveFileToGCS(url: string, file: any) {
        const headers = {
            withCredentials: false,
            headers: {
                'Cache-Control': 'no-store',
            },
        };
        return this.http.put(url, file, headers);
    }
}
