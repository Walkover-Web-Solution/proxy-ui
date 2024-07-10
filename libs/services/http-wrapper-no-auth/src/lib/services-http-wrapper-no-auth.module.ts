import { Inject, Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { cloneDeep } from 'lodash-es';
import { Observable, finalize, tap } from 'rxjs';
import { ProxyBaseUrls } from '@proxy/models/root-models';

@NgModule({
    imports: [CommonModule],
})
export class ServicesHttpWrapperNoAuthModule {
    public static forRoot(): ModuleWithProviders<ServicesHttpWrapperNoAuthModule> {
        return {
            ngModule: ServicesHttpWrapperNoAuthModule,
        };
    }
}
export const DEFAULT_OPTIONS = {
    withCredentials: false,
    headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': '',
    },
};

@Injectable({
    providedIn: ServicesHttpWrapperNoAuthModule,
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

    public post<T>(url: string, body: any, options?: any): Observable<any> {
        options = { withCredentials: true, ...options };
        options = this.prepareOptions(options);
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

    public prepareOptions(options: any): any {
        const newOptions = {
            ...cloneDeep(DEFAULT_OPTIONS),
            ...(options || {}),
        };
        if (!newOptions.headers) {
            newOptions.headers = {} as any;
        }

        // eslint-disable-next-line no-prototype-builtins
        if (newOptions.headers.hasOwnProperty('noHeader')) {
            // eslint-disable-next-line no-prototype-builtins
            if (newOptions.headers.hasOwnProperty('Content-Type')) {
                delete newOptions.headers['Content-Type'];
            }
            delete newOptions.headers['noHeader'];
        }

        if (newOptions['withCredentials']) {
            newOptions['withCredentials'] = true;
        } else {
            newOptions['withCredentials'] = false;
        }
        newOptions.headers = new HttpHeaders(newOptions.headers);
        return newOptions;
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
