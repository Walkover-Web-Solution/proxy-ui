import { Route } from '@angular/router';

export const featuresRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./feature/feature.component').then((c) => c.FeatureComponent),
        pathMatch: 'full',
    },
    {
        path: 'create',
        loadComponent: () => import('./create-feature/create-feature.component').then((c) => c.CreateFeatureComponent),
    },
    {
        path: 'manage/:id',
        loadComponent: () => import('./create-feature/create-feature.component').then((c) => c.CreateFeatureComponent),
    },
];
