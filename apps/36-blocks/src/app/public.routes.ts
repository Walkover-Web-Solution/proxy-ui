import { Route } from '@angular/router';

export const publicRoutes: Route[] = [
    { path: '', redirectTo: 'register', pathMatch: 'full' },
    {
        path: 'register',
        loadComponent: () => import('./register/register.component').then((c) => c.RegisterComponent),
    },
];
