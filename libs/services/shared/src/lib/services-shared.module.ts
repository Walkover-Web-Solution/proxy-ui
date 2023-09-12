import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServicesHttpWrapperModule, HttpWrapperService } from '@proxy/services/httpWrapper';
@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class ServicesSharedModule {}

@Injectable({
    providedIn: ServicesSharedModule,
})
export class SharedService {
    constructor(private http: HttpWrapperService) {}

    public getEmailTemplate(payload): Observable<any> {
        return this.http.get(payload.url, payload.params, payload.options);
    }

    public getEmailDomain(payload): Observable<any> {
        return this.http.get(payload.url, payload.params, payload.options);
    }

    public getSMSTemplate(payload: any): Observable<any> {
        return this.http.post(payload.url, payload?.request);
    }

    public getSMSTemplateDetails(payload): Observable<any> {
        return this.http.post(payload.url, { id: payload?.id });
    }
}
