import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@proxy/services/proxy/auth';
import { CookieService } from 'ngx-cookie-service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, map, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CanActivateRouteGuard {
    constructor(
        private cookieService: CookieService,
        private authService: AuthService,
        private afAuth: AngularFireAuth,
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
        const memoryToken = this.authService.getTokenSync();
        if (memoryToken) {
            return true;
        }
        return this.afAuth.authState.pipe(
            take(1),
            map((user) => (user ? true : this.router.createUrlTree([''])))
        );
    }
}
