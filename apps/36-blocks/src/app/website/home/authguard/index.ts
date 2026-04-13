import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@proxy/services/proxy/auth';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CanActivateRouteGuard {
    constructor(
        private cookieService: CookieService,
        private authService: AuthService,
        private router: Router
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
        return this.router.createUrlTree(['']);
    }
}
