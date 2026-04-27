import { Component, inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '@proxy/services/proxy/auth';
import { CanActivateRouteGuard } from './website/home/authguard';

@Component({ template: '', standalone: true })
class NotFoundRedirectComponent {}

export const appRoutes: Route[] = [
    {
        path: '',
        loadChildren: () => import('./website/website.routes').then((r) => r.websiteRoutes),
    },
    {
        path: 'onboarding',
        loadComponent: () => import('./panel/onboarding/onboarding.component').then((c) => c.OnboardingComponent),
    },
    {
        path: 'app',
        loadChildren: () => import('./panel/panel.routes').then((r) => r.panelRoutes),
    },
    {
        path: 'widget-preview/:referenceId',
        loadComponent: () =>
            import('./panel/features/create-feature/feature-preview/widget-preview/widget-preview.component').then(
                (c) => c.WidgetPreviewComponent
            ),
        canActivate: [CanActivateRouteGuard],
    },
    {
        path: 'project',
        loadComponent: () =>
            import('./panel/create-project/create-project.component').then((c) => c.CreateProjectComponent),
        canActivate: [CanActivateRouteGuard],
    },
    {
        path: 'client',
        children: [
            {
                path: 'registration',
                loadComponent: () =>
                    import('./core/registration/registration.component').then((c) => c.RegistrationComponent),
            },
        ],
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
