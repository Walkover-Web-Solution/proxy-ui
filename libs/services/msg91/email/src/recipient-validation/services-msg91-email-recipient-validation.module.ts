import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseResponse, IPaginatedEmailResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    IBulkMailValidationReq,
    IRecipientValidation,
    IRecipientValidationReq,
    ISingleMailValidationReq,
    IValidationTerminology,
} from '@msg91/models/email-models';
import { Observable } from 'rxjs';
import { RecipientValidationUrls } from '@msg91/urls/email/recipient-validation';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91EmailRecipientValidationModule {}

@Injectable({
    providedIn: ServicesMsg91EmailRecipientValidationModule,
})
export class RecipientValidationService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.EmailProxy) private emailBaseUrl: any) {}

    public checkSingleMailValidation(
        payload: ISingleMailValidationReq
    ): Observable<BaseResponse<IRecipientValidation, ISingleMailValidationReq>> {
        return this.http.post<BaseResponse<IRecipientValidation, ISingleMailValidationReq>>(
            RecipientValidationUrls.checkSingleMailValidation(this.emailBaseUrl),
            payload
        );
    }

    public checkBulkMailValidation(
        payload: FormData
    ): Observable<BaseResponse<IRecipientValidation, IBulkMailValidationReq>> {
        return this.http.post<BaseResponse<IRecipientValidation, IBulkMailValidationReq>>(
            RecipientValidationUrls.checkBulkMailValidation(this.emailBaseUrl),
            payload
        );
    }

    public getValidationLogs(
        params: IRecipientValidationReq
    ): Observable<BaseResponse<IPaginatedEmailResponse<IRecipientValidation[]>, IRecipientValidationReq>> {
        return this.http.get<BaseResponse<IPaginatedEmailResponse<IRecipientValidation[]>, IRecipientValidationReq>>(
            RecipientValidationUrls.getValidationLogs(this.emailBaseUrl),
            params
        );
    }

    public getValidationTerminology(): Observable<BaseResponse<IValidationTerminology, void>> {
        return this.http.get<BaseResponse<IValidationTerminology, void>>(
            RecipientValidationUrls.getValidationTerminology(this.emailBaseUrl)
        );
    }

    public getValidationReports(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get<BaseResponse<any, any>>(
            RecipientValidationUrls.getValidationReports(this.emailBaseUrl),
            params
        );
    }

    public deleteValidationFile(id: string): Observable<BaseResponse<any, string>> {
        return this.http.delete<BaseResponse<any, string>>(
            RecipientValidationUrls.deleteValidationFile(this.emailBaseUrl) + `/${id}`
        );
    }
}
