import { inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '@proxy/services/proxy/auth';

@Injectable({ providedIn: 'root' })
export class LoggedInGuard {
    private readonly cookieService = inject(CookieService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    canActivate(): boolean | UrlTree {
        const cookieToken = this.cookieService.get('authToken');
        const memoryToken = this.authService.getTokenSync();
        if (cookieToken || memoryToken) {
            return this.router.createUrlTree(['/app/dashboard']);
        }
        return true;
    }
}
