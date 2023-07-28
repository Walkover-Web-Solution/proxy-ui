import { CommonModule } from '@angular/common';
import { NgModule, Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IGetAllPhoneBookResModel,
    ICreatePhoneBookReqModel,
    UpdatePhoneBookResModel,
} from '@msg91/models/segmento-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SegmentoUrls } from '@msg91/urls/segmento';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91SegmentoModule {}

@Injectable({
    providedIn: ServicesMsg91SegmentoModule,
})
export class SegmentoService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.SegmentoBaseURL) private baseUrl: any) {}

    public getAllPhoneBook(request: any): Observable<BaseResponse<IGetAllPhoneBookResModel[], null>> {
        return this.http.get(SegmentoUrls.getAllPhoneBooksUrl(this.baseUrl), request).pipe(
            map((res) => {
                const data: BaseResponse<IGetAllPhoneBookResModel[], null> = res;
                data.request = request;
                return data;
            })
        );
    }

    public createPhoneBook(
        payload: ICreatePhoneBookReqModel
    ): Observable<BaseResponse<UpdatePhoneBookResModel, ICreatePhoneBookReqModel>> {
        return this.http.post<BaseResponse<UpdatePhoneBookResModel, ICreatePhoneBookReqModel>>(
            SegmentoUrls.createPhoneBook(this.baseUrl),
            payload
        );
    }

    public updatePhoneBook(
        payload: ICreatePhoneBookReqModel,
        phoneBookId: string
    ): Observable<BaseResponse<UpdatePhoneBookResModel, ICreatePhoneBookReqModel>> {
        return this.http.patch<BaseResponse<UpdatePhoneBookResModel, ICreatePhoneBookReqModel>>(
            SegmentoUrls.updatePhoneBook(this.baseUrl).replace(':phoneBookId', phoneBookId),
            payload
        );
    }

    public deletePhoneBook(
        phoneBookId: string
    ): Observable<BaseResponse<IGetAllPhoneBookResModel, { phoneBookId: string }>> {
        return this.http.delete<BaseResponse<IGetAllPhoneBookResModel, { phoneBookId: string }>>(
            SegmentoUrls.updatePhoneBook(this.baseUrl).replace(':phoneBookId', phoneBookId)
        );
    }

    public restorePhoneBook(phonebookId: string): Observable<BaseResponse<{ message: string }, void>> {
        return this.http.patch<BaseResponse<{ message: string }, void>>(
            SegmentoUrls.restorePhoneBook(this.baseUrl).replace(':phoneBookId', phonebookId),
            {}
        );
    }

    public getPhoneBookDetail(
        phoneBookId: string
    ): Observable<BaseResponse<IGetAllPhoneBookResModel, { phoneBookId: string }>> {
        return this.http.get<BaseResponse<IGetAllPhoneBookResModel, { phoneBookId: string }>>(
            SegmentoUrls.updatePhoneBook(this.baseUrl).replace(':phoneBookId', phoneBookId)
        );
    }
}
