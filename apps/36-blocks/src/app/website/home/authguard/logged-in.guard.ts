import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class LoggedInGuard {
    private readonly cookieService = inject(CookieService);
    private readonly router = inject(Router);
    private readonly platformId = inject(PLATFORM_ID);

    canActivate(): boolean | UrlTree {
        if (!isPlatformBrowser(this.platformId)) {
            return true;
        }
        const authToken = this.cookieService.get('authToken');
        if (authToken) {
            return this.router.createUrlTree(['/app/dashboard']);
        }
        return true;
    }
}
