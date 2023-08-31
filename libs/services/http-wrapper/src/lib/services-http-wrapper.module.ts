import { cloneDeep } from 'lodash-es';
import { finalize, tap } from 'rxjs/operators';
import { NgModule, Inject, Injectable, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProxyBaseUrls } from '@proxy/models/root-models';
import { AuthService } from '@proxy/services/proxy/auth';
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

export const DEFAULT_OPTIONS = {
    withCredentials: false,
    headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': '',
    },
};

@Injectable({
    providedIn: 'root',
})
export class HttpWrapperService {
    constructor(
        private http: HttpClient,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        private authService: AuthService
    ) {}

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
        const newOptions = {
            ...cloneDeep(DEFAULT_OPTIONS),
            ...(options || {}),
        };
        if (!newOptions.headers) {
            newOptions.headers = {} as any;
        }
        const authToken = this.authService.getTokenSync();
        if (authToken && !options?.headers?.['Authorization']) {
            newOptions.headers['Authorization'] = authToken;
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
