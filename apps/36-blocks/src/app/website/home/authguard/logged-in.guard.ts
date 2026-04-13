import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '@proxy/services/proxy/auth';

@Injectable({ providedIn: 'root' })
export class LoggedInGuard {
    private readonly cookieService = inject(CookieService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly platformId = inject(PLATFORM_ID);

    canActivate(): boolean | UrlTree {
        if (!isPlatformBrowser(this.platformId)) {
            return true;
        }
        const cookieToken = this.cookieService.get('authToken');
        const memoryToken = this.authService.getTokenSync();
        if (cookieToken || memoryToken) {
            return this.router.createUrlTree(['/app/dashboard']);
        }
        return true;
    }
}
