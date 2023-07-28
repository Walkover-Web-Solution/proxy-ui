import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    { path: '', redirectTo: 'app', pathMatch: 'full' },
    {
        path: 'app',
        loadChildren: () => import('./layout/layout.module').then((p) => p.LayoutModule),
    },
];
