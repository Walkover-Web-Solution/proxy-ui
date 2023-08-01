import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponse, ILoginResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { AuthService } from '@proxy/services/proxy/auth';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
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

    public googleLogin(body): Observable<BaseResponse<ILoginResponse, void>> {
        return this.http.post<BaseResponse<ILoginResponse, void>>(`${this.baseUrl}/googleLogin`, body);
    }

    public logout(): Observable<BaseResponse<{ message: string }, void>> {
        return this.http.delete<BaseResponse<{ message: string }, void>>(`${this.baseUrl}/logout`);
    }
}
