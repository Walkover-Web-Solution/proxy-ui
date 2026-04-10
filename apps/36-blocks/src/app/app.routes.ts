import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        loadChildren: () => import('./website/website.routes').then((r) => r.websiteRoutes),
    },
    {
        path: '',
        loadChildren: () => import('./panel/panel.routes').then((r) => r.panelRoutes),
    },
];
