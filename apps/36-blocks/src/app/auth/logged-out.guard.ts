import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

/**
 * Protects the landing page (/) from authenticated users.
 * Uses only the synchronous cookie check — no Firebase, no async.
 * Authenticated users are redirected to /app/dashboard.
 */
@Injectable({ providedIn: 'root' })
export class LoggedOutGuard {
    constructor(
        private cookieService: CookieService,
        private router: Router
    ) {}

    canActivate(): boolean | UrlTree {
        const authToken = this.cookieService.get('authToken');
        if (authToken) {
            return this.router.createUrlTree(['/app', 'dashboard']);
        }
        return true;
    }
}
