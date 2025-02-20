import { Route } from '@angular/router';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const appRoutes: Route[] = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadChildren: () => import('./auth/auth.module').then((p) => p.AuthModule),
    },
    {
        path: 'app',
        loadChildren: () => import('./layout/layout.module').then((p) => p.LayoutModule),
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard],
    },
    {
        path: 'project',
        loadChildren: () => import('../app/create-project/create-project.module').then((p) => p.CreateProjectModule),
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard],
    },
    {
        path: 'p',
        loadChildren: () => import('./public.module').then((p) => p.PublicModule),
    },
];
