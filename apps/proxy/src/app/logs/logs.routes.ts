import { Route } from '@angular/router';

export const logsRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./log/log.component').then((c) => c.LogComponent),
        data: { title: 'Logs' },
        pathMatch: 'full',
    },
];
