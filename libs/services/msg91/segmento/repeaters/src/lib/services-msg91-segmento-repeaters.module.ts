import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { BaseFilterRequest, BaseResponse, IPaginatedResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { Observable } from 'rxjs';
import { RepeaterUrls } from '@msg91/urls/segmento';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesMsg91SegmentoRepeatersModule {}

@Injectable({
    providedIn: ServicesMsg91SegmentoRepeatersModule,
})
export class RepeaterService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.SegmentoBaseURL) private baseUrl: any) {}

    public getRepeaterFrequencies(): Observable<BaseResponse<any[], null>> {
        return this.http.get<BaseResponse<any[], BaseFilterRequest>>(RepeaterUrls.repeaterFrequencies(this.baseUrl));
    }

    public getRepeaters(
        request: any,
        segmentId: number
    ): Observable<BaseResponse<IPaginatedResponse<any[]>, BaseFilterRequest>> {
        return this.http.get<BaseResponse<IPaginatedResponse<any[]>, BaseFilterRequest>>(
            RepeaterUrls.repeatersUrl(this.baseUrl).replace(':segmentId', segmentId.toString()),
            request
        );
    }

    public getRepeater(segmentId: number, repeaterId: number): Observable<BaseResponse<any, null>> {
        return this.http.get<BaseResponse<any, null>>(
            RepeaterUrls.getRepeaterUrl(this.baseUrl)
                .replace(':segmentId', segmentId.toString())
                .replace(':repeaterId', repeaterId.toString())
        );
    }

    public createRepeater(body: any, segmentId: number): Observable<BaseResponse<any, null>> {
        return this.http.post<BaseResponse<any, null>>(
            RepeaterUrls.repeatersUrl(this.baseUrl).replace(':segmentId', segmentId.toString()),
            body
        );
    }

    public updateRepeater(body: any, segmentId: number, repeaterId: number): Observable<BaseResponse<any, null>> {
        return this.http.patch<BaseResponse<any, null>>(
            RepeaterUrls.getRepeaterUrl(this.baseUrl)
                .replace(':segmentId', segmentId.toString())
                .replace(':repeaterId', repeaterId.toString()),
            body
        );
    }

    public getRepeaterStatus(): Observable<BaseResponse<any[], null>> {
        return this.http.get<BaseResponse<any[], null>>(RepeaterUrls.getRepeaterStatus(this.baseUrl));
    }

    public deleteRepeater(segmentId: number, repeaterId: number): Observable<BaseResponse<any, null>> {
        return this.http.delete<BaseResponse<any, null>>(
            RepeaterUrls.getRepeaterUrl(this.baseUrl)
                .replace(':segmentId', segmentId.toString())
                .replace(':repeaterId', repeaterId.toString())
        );
    }
}
