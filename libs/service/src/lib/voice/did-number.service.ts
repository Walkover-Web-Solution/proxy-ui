import { Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Country, DidNumber, MobileNumber, NumbersAllResponse, TollFreeNumber } from '@msg91/service';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { URLS } from './models/api-urls';
import { VoiceLibServiceModule } from './voice.module';

@Injectable({ providedIn: VoiceLibServiceModule })
export class DidNumberService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.VoiceBaseURL) private baseUrl: any) {}

    public getAllDidNumbers(): Observable<BaseResponse<{ data: DidNumber[] }, void>> {
        return this.http.get(`${this.baseUrl}${URLS.DID_NUMBERS.GET_ALL_LOGS}?page_size=100`);
    }

    public updateDidNumber(
        id: number,
        didNumber: Partial<DidNumber>
    ): Observable<{ status: string; message: string; errors: string }> {
        const type = didNumber.assign_type;
        delete didNumber.assign_type;
        return this.http.put(`${this.baseUrl}${URLS.DID_NUMBERS.UPDATE_DID_NUMBER.replace(':id', id.toString())}`, {
            ...didNumber,
            type,
        });
    }

    public getCountry(): Observable<Country[]> {
        return this.http.get(`${this.baseUrl}${URLS.DID_NUMBERS.GET_COUNTRY}`);
    }

    public getNumbers(countryId: number): Observable<NumbersAllResponse> {
        return this.http.get(`${this.baseUrl}${URLS.DID_NUMBERS.GET_NUMBERS.replace(':id', countryId.toString())}`);
    }

    public getTollFree(countryId: number): Observable<{ did_numbers: TollFreeNumber[] }> {
        return this.http.get(
            `${this.baseUrl}${URLS.DID_NUMBERS.GET_TOLLFREE_NUMBERS.replace(':id', countryId.toString())}`
        );
    }

    public getMobileNumbers(countryId: number): Observable<{ mobile_numbers: MobileNumber[] }> {
        return this.http.get(
            `${this.baseUrl}${URLS.DID_NUMBERS.GET_MOBILE_NUMBERS.replace(':id', countryId.toString())}`
        );
    }

    public getDidByCity(cityId: number): Observable<NumbersAllResponse> {
        return this.http.get(
            `${this.baseUrl}${URLS.DID_NUMBERS.GET_DID_NUMBERS_BY_CITY.replace(':id', cityId.toString())}`
        );
    }

    public buyNumber(model): Observable<any> {
        return this.http.post(`${this.baseUrl}${URLS.DID_NUMBERS.BUY_NUMBER}`, model);
    }

    public deleteNumber(model): Observable<any> {
        const options = {
            body: model,
        };
        return this.http.delete(`${this.baseUrl}${URLS.DID_NUMBERS.BUY_NUMBER}`, options);
    }

    public deselectFlow(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}${URLS.DID_NUMBERS.GET_ALL_LOGS}${id}`);
    }

    public requestNumber(countryId: number): Observable<any> {
        return this.http.post(`${this.baseUrl}${URLS.DID_NUMBERS.REQUEST_NUMBER}${countryId}`, {});
    }
}
