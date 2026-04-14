import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '@proxy/services/proxy/auth';

@Injectable({ providedIn: 'root' })
export class AuthInitializerService {
    private readonly cookieService = inject(CookieService);
    private readonly authService = inject(AuthService);
    private readonly platformId = inject(PLATFORM_ID);

    initialize(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        const existingToken = this.cookieService.get('authToken');
        if (existingToken) {
            this.authService.setTokenSync(existingToken);
        }
    }
}
