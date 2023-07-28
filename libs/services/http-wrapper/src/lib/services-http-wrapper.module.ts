import { finalize, tap } from 'rxjs/operators';
import { NgModule, Inject, Injectable, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProxyBaseUrls } from '@msg91/models/root-models';
@NgModule({
    imports: [CommonModule],
})
export class ServicesHttpWrapperModule {
    public static forRoot(): ModuleWithProviders<ServicesHttpWrapperModule> {
        return {
            ngModule: ServicesHttpWrapperModule,
            providers: [HttpWrapperService],
        };
    }
}

@Injectable({
    providedIn: 'root',
})
export class HttpWrapperService {
    constructor(private http: HttpClient, @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any) {}

    public createUrl = (url: string): string => {
        return `${this.baseUrl}/${url}`;
    };

    public get<T>(url: string, params?: any, options?: any): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options);
        options.params = params;
        return this.http.get<T>(url, options).pipe(
            tap((res) => {}),
            finalize(() => {})
        );
    }

    public post<T>(url: string, body: any, options?: any, addcontentType: boolean = true): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options, addcontentType);
        return this.http.post<T>(url, body, options).pipe(
            tap((res) => {}),
            finalize(() => {})
        );
    }

    public put<T>(url: string, body: any, options?: any): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options);
        return this.http.put<T>(url, body, options).pipe(
            tap((res) => {}),
            finalize(() => {})
        );
    }

    public delete<T>(url: string, params?: any, options?: any): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options);
        options.search = this.objectToParams(params);
        return this.http.delete<T>(url, options).pipe(
            tap((res) => {}),
            finalize(() => {})
        );
    }

    public patch<T>(url: string, body: any, options?: any): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options);
        return this.http.patch<T>(url, body, options).pipe(
            tap((res) => {}),
            finalize(() => {})
        );
    }

    public prepareOptions(options: any, addcontentType: boolean = true): any {
        options = options || {};

        if (!options.headers) {
            options.headers = {} as any;
        }
        // eslint-disable-next-line no-prototype-builtins
        if (options.headers.hasOwnProperty('noHeader')) {
            // eslint-disable-next-line no-prototype-builtins
            if (options.headers.hasOwnProperty('Content-Type')) {
                delete options.headers['Content-Type'];
            }
            delete options.headers['noHeader'];
        }

        if (options['withCredentials']) {
            options['withCredentials'] = true;
        } else {
            options['withCredentials'] = false;
        }
        options.headers = new HttpHeaders(options.headers);
        return options;
    }

    public isPrimitive(value) {
        return value == null || (typeof value !== 'function' && typeof value !== 'object');
    }

    public objectToParams(object = {}) {
        return Object.keys(object)
            .map((value) => {
                const objectValue = this.isPrimitive(object[value]) ? object[value] : JSON.stringify(object[value]);
                return `${value}=${objectValue}`;
            })
            .join('&');
    }
}
