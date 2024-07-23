import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
    imports: [CommonModule],
})
export class ServicesErrorInterceptorModule {}

@Injectable({
    providedIn: ServicesErrorInterceptorModule,
})
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        private afAuth: AngularFireAuth,
        private toast: PrimeNgToastService,
        private cookieService: CookieService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (
            request.url.includes('api/register') ||
            request.url.includes('api/googleLogin') ||
            this.cookieService.get('authToken')
        ) {
            return next.handle(request).pipe(
                tap((resp: HttpResponse<any>) => {}),
                catchError((err) => {
                    if (err instanceof HttpErrorResponse) {
                        if (err.status === 401) {
                            this.cookieService.delete('authToken', '/');
                            if (err.error?.errors?.length) {
                                this.toast.error(
                                    typeof err.error?.errors === 'string' ? err.error?.errors : err.error?.errors[0]
                                );
                            } else {
                                this.toast.error('Session expired');
                            }
                            this.afAuth.signOut();
                            this.router.navigate(['/']);
                            return throwError(err.error);
                        }
                        if (err.status === 422) {
                            return throwError(err.error);
                        }
                        if (err.status === 500) {
                            return throwError({
                                errors: err.error?.errors?.length ? err?.error.errors : 'Internal server error',
                                hasError: true,
                            });
                        }
                        if (err.status === 403) {
                            // Commented as per https://app.clickup.com/t/8678ypxpx?comment=90100030787886
                            // this.router.navigate(['/app']);
                            return throwError({
                                errors: err.error?.errors,
                                hasError: true,
                                errorCode: err.status,
                            });
                        }
                        if (err.status === 400 || err.status === 429) {
                            return throwError({
                                errors: err.error?.errors,
                                hasError: true,
                                errorCode: err.status,
                            });
                        }
                        if (err.status === 404) {
                            if (typeof err.error === 'string' || err.error instanceof String) {
                                return throwError({
                                    errors: err.error?.length ? err?.error : 'Internal server error',
                                    hasError: true,
                                });
                            } else if (typeof err.error === 'object' || err.error instanceof Object) {
                                return throwError({
                                    errors: err.error?.errors,
                                    hasError: true,
                                    data: err.error?.data,
                                    status: err.error?.status,
                                });
                            }
                            return throwError({ ...err.error, hasError: true });
                        }
                        return throwError(err);
                    }
                })
            );
        }
        return EMPTY;
    }
}
