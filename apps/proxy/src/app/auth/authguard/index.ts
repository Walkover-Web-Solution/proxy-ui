import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@msg91/services/admin/auth';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CanActivateRouteGuard implements CanActivate {
    constructor(
        private cookieService: CookieService,
        private authService: AuthService
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const authToken = this.cookieService.get('authToken');
        if (authToken) {
            this.authService.setTokenSync(authToken);
            return true;
        }
        return false;
    }
}
