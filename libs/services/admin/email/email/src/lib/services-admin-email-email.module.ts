import { CommonModule } from '@angular/common';
import { NgModule, Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { AdminHelloService, ServicesAdminHelloModule } from '@msg91/services/admin/hello';
import { AdminEmailMainUrls } from 'libs/service/src/lib/utils/admin/email/email-urls';
import { AuthService, ServicesAdminAuthModule } from '@msg91/services/admin/auth';
import { ServicesHttpWrapperModule, HttpWrapperService } from '@msg91/services/httpWrapper';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule, ServicesAdminAuthModule, ServicesAdminHelloModule],
})
export class ServicesAdminEmailEmailModule {}

@Injectable({
    providedIn: ServicesAdminEmailEmailModule,
})
export class AdminEmailMainService {
    public apiAuthenticationStatusInProcess$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public options = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': '',
        },
        withCredentials: false,
    };

    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        private authService: AuthService,
        private auth: AdminHelloService
    ) {}

    public userAuthenticationByEmail(): Observable<boolean> {
        this.apiAuthenticationStatusInProcess$.next(true);
        this.options.headers.Authorization = this.authService.getFCMTokenSync();
        return this.http
            .get(AdminEmailMainUrls.userAuthenticationByEmail(`${this.baseUrl}/api/admin`), {}, this.options)
            .pipe(
                map((res) => {
                    const data: BaseResponse<any, null> = res;
                    this.authService.setTokenSync(res.authorization);
                    this.apiAuthenticationStatusInProcess$.next(false);
                    return true;
                }),
                catchError((error) => {
                    return this.auth.authentication();
                })
            );
    }

    public getAdminLogout(): Observable<any> {
        this.options.headers.Authorization = this.authService.getTokenSync();
        return this.http.get<any>(AdminEmailMainUrls.userLogout(`${this.baseUrl}/api/admin`), {}, this.options);
    }

    public getAuthenticationStatusInProcess(): Observable<boolean> {
        return this.apiAuthenticationStatusInProcess$.asObservable();
    }
}
