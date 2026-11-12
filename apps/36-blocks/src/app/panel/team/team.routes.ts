import { Route } from '@angular/router';

export const teamRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./team.component').then((c) => c.TeamComponent),
        children: [
            { path: '', redirectTo: 'members', pathMatch: 'full' },
            {
                path: 'members',
                loadComponent: () => import('./members/members.component').then((c) => c.MembersComponent),
            },
            {
                path: 'roles',
                loadComponent: () => import('./roles/roles.component').then((c) => c.RolesComponent),
            },
            {
                path: 'api-keys',
                loadComponent: () => import('./api-keys/api-keys.component').then((c) => c.ApiKeysComponent),
            },
        ],
    },
];
