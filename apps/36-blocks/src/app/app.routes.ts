import { Route } from '@angular/router';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const appRoutes: Route[] = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./auth/auth.component').then((c) => c.AuthComponent),
    },
    {
        path: 'app',
        loadChildren: () => import('./layout/layout.routes').then((r) => r.layoutRoutes),
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard],
    },
    {
        path: 'project',
        loadComponent: () => import('./create-project/create-project.component').then((c) => c.CreateProjectComponent),
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard],
    },
    {
        path: 'p',
        loadChildren: () => import('./public.routes').then((r) => r.publicRoutes),
    },
    {
        path: 'client',
        loadChildren: () => import('./client.routes').then((r) => r.clientRoutes),
    },
];
