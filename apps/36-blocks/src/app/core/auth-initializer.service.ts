import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '@proxy/services/proxy/auth';

@Injectable({ providedIn: 'root' })
export class AuthInitializerService {
    private readonly cookieService = inject(CookieService);
    private readonly authService = inject(AuthService);

    initialize(): void {
        const existingToken = this.cookieService.get('authToken');
        if (existingToken) {
            this.authService.setTokenSync(existingToken);
        }
    }
}
