import { Component, inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '@proxy/services/proxy/auth';

@Component({ template: '', standalone: true })
class NotFoundRedirectComponent {}

export const appRoutes: Route[] = [
    {
        path: '',
        loadChildren: () => import('./website/website.routes').then((r) => r.websiteRoutes),
    },
    {
        path: '',
        loadChildren: () => import('./panel/panel.routes').then((r) => r.panelRoutes),
    },
    {
        path: '**',
        component: NotFoundRedirectComponent,
        canActivate: [
            () => {
                const router = inject(Router);
                const cookieService = inject(CookieService);
                const authService = inject(AuthService);
                const isLoggedIn = !!(cookieService.get('authToken') || authService.getTokenSync());
                return router.createUrlTree(isLoggedIn ? ['/app/dashboard'] : ['']);
            },
        ],
    },
];
