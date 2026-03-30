import { Inject, Injectable } from '@angular/core';
import { BaseResponse, ILoginResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { AuthService } from '@proxy/services/proxy/auth';
import { DEFAULT_OPTIONS, HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class LoginService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any) {}

    public googleLogin(authToken: string): Observable<BaseResponse<ILoginResponse, void>> {
        const options = Object.assign({}, DEFAULT_OPTIONS);
        options.headers.Authorization = authToken;
        return this.http.post<BaseResponse<ILoginResponse, void>>(`${this.baseUrl}/googleLogin`, {}, options);
    }

    public logout(): Observable<BaseResponse<{ message: string }, void>> {
        return this.http.delete<BaseResponse<{ message: string }, void>>(`${this.baseUrl}/logout`);
    }
}
