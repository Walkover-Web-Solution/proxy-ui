import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, ILoginResponse, ProxyBaseUrls } from '@proxy/models/root-models';
import { AuthService } from '@proxy/services/proxy/auth';
import { DEFAULT_OPTIONS, HttpWrapperService } from '@proxy/services/httpWrapper';
import { Observable } from 'rxjs';

@NgModule({
    imports: [CommonModule],
})
export class ServicesLoginModule {}

@Injectable({
    providedIn: ServicesLoginModule,
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
