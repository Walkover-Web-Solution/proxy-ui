import { Route } from '@angular/router';
import { CanActivateRouteGuard } from './auth/authguard';
import { LoggedOutGuard } from './auth/logged-out.guard';

export const appRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./auth/auth.component').then((c) => c.AuthComponent),
        canActivate: [LoggedOutGuard],
    },
    {
        path: 'app',
        loadChildren: () => import('./layout/layout.routes').then((r) => r.layoutRoutes),
        canActivate: [CanActivateRouteGuard],
    },
    {
        path: 'widget-preview/:referenceId',
        loadComponent: () =>
            import('./features/create-feature/feature-preview/widget-preview/widget-preview.component').then(
                (c) => c.WidgetPreviewComponent
            ),
        canActivate: [CanActivateRouteGuard],
    },
    {
        path: 'project',
        loadComponent: () => import('./create-project/create-project.component').then((c) => c.CreateProjectComponent),
        canActivate: [CanActivateRouteGuard],
    },
    {
        path: 'p',
        loadChildren: () => import('./public.routes').then((r) => r.publicRoutes),
    },
    {
        path: 'client',
        loadChildren: () => import('./client.routes').then((r) => r.clientRoutes),
    },
    {
        path: '**',
        loadComponent: () => import('./auth/auth.component').then((c) => c.AuthComponent),
        canActivate: [LoggedOutGuard],
    },
];
