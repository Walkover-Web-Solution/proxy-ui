import { Route } from '@angular/router';

export const websiteRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./auth/auth.component').then((c) => c.AuthComponent),
    },
    {
        path: 'pricing',
        loadComponent: () => import('./pricing/pricing.component').then((c) => c.PricingComponent),
    },
];
