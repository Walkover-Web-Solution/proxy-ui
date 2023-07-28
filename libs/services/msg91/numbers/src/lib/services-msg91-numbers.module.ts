import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { MicroserviceBaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { NumbersUrls } from '@msg91/urls/numbers';
import { Observable } from 'rxjs';
import {
    INumberIntegrations,
    INumberIntegrationsWithPagination,
    INumberAvailableLongCode,
} from '@msg91/models/numbers-models';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91NumbersModule {}

@Injectable({
    providedIn: ServicesMsg91NumbersModule,
})
export class NumbersService {
    constructor(@Inject(ProxyBaseUrls.NumbersProxy) private numbersURL: any, private http: HttpWrapperService) {}

    public getNumberIntegrations(
        params: any
    ): Observable<MicroserviceBaseResponse<INumberIntegrationsWithPagination<INumberIntegrations[]>, any>> {
        return this.http.get<MicroserviceBaseResponse<INumberIntegrationsWithPagination<INumberIntegrations[]>, any>>(
            NumbersUrls.integration(this.numbersURL),
            params
        );
    }

    public addNumberIntegrations(request: any): Observable<MicroserviceBaseResponse<INumberIntegrations, any>> {
        return this.http.post<MicroserviceBaseResponse<INumberIntegrations, any>>(
            NumbersUrls.integration(this.numbersURL),
            request
        );
    }

    public editNumberIntegrations(
        id: number | string,
        request: any
    ): Observable<MicroserviceBaseResponse<INumberIntegrations, any>> {
        return this.http.put<MicroserviceBaseResponse<INumberIntegrations, any>>(
            NumbersUrls.editIntegration(this.numbersURL).replace(':id', id.toString()),
            request
        );
    }
    public deleteNumberCallbacks(request: any): Observable<MicroserviceBaseResponse<any, any>> {
        return this.http.delete<MicroserviceBaseResponse<any, any>>(
            NumbersUrls.integration(this.numbersURL),
            {},
            {
                body: request,
            }
        );
    }

    public getDropdownData(request: any): Observable<MicroserviceBaseResponse<INumberAvailableLongCode, any>> {
        return this.http.get<MicroserviceBaseResponse<INumberAvailableLongCode, any>>(
            NumbersUrls.availableLongcode(this.numbersURL),
            request
        );
    }
}
