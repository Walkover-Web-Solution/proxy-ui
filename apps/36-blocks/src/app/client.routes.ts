import { Route } from '@angular/router';

export const clientRoutes: Route[] = [
    {
        path: 'registration',
        loadComponent: () => import('./registration/registration.component').then((c) => c.RegistrationComponent),
    },
];
