import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
    imports: [CommonModule],
})
export class ServicesErrorInterceptorModule {}

@Injectable({
    providedIn: ServicesErrorInterceptorModule,
})
export class ErrorInterceptor implements HttpInterceptor {
    private routesFor400RequestHandle = ['/m/l/whatsapp/number', '/m/l/whatsapp/templates', '/m/l/rcs/templates'];

    constructor(
        private router: Router,
        @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any,
        private toast: PrimeNgToastService,
        private cookieService: CookieService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap((resp: HttpResponse<any>) => {
                if (
                    resp.type &&
                    resp.body &&
                    resp.body['errors'] &&
                    resp.body['errors'].length &&
                    resp.body['errors'][0] &&
                    resp.body['errors'][0].title === '503'
                ) {
                    //  this.router.navigate(['under-maintenance']);
                }
            }),
            catchError((err) => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 401) {
                        this.cookieService.delete('cs_msg91', '/');
                        this.cookieService.delete('us_msg91', '/');
                        location.href = this.baseUrl + '/logout.php';
                        return throwError({
                            errors: 'Session has expired. Logging out. . . . . .',
                            hasError: true,
                        });
                    }
                    const error: string[] = [];
                    error.push('Error  ' + err.status.toString() + ': ' + err.message);
                    // this.toastr.error(err.message);
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
                        if (this.router.url.includes('m/l/email')) {
                            // this.toast.error('Please subscribe to an email plan.');
                            this.router.navigate(['/m', 'l', 'email', 'subscription-plans'], {
                                queryParams: {
                                    disable_back: true,
                                },
                                queryParamsHandling: 'merge',
                            });
                        }
                        return throwError({
                            data: err.error?.data,
                            errors: err.error?.errors,
                            hasError: true,
                        });
                    }

                    if (err.status === 400 && this.router.url.includes('/m/l/knowledgebase')) {
                        return throwError({
                            errors: err.error?.message,
                            hasError: true,
                            data: err.error?.data,
                            status: err.error?.status,
                        });
                    }

                    if (err.status === 400 && this.routesFor400RequestHandle.find((e) => e === this.router.url)) {
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
                    if (
                        (err.status === 413 || err.status === 0) &&
                        (this.router.url.includes('contacts/import-contact') ||
                            this.router.url.includes('m/l/email/validations/bulk'))
                    ) {
                        return throwError({
                            errors: 'File size too large.',
                            hasError: true,
                            data: err.error?.data,
                            status: err.error?.status,
                        });
                    }
                    return throwError({
                        data: err.error?.data,
                        errors: err.error?.errors,
                        hasError: true,
                    });
                }
            })
        );
    }
}
