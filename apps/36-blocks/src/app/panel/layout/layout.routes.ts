import { Route } from '@angular/router';
import { CanActivateRouteGuard } from '../../website/home/authguard';

export const layoutRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./layout.component').then((c) => c.LayoutComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'logs',
                loadChildren: () => import('../logs/logs.routes').then((r) => r.logsRoutes),
            },
            {
                path: 'dashboard',
                loadComponent: () => import('../dashboard/dashboard.component').then((c) => c.DashboardComponent),
            },
            {
                path: 'features',
                loadChildren: () => import('../features/features.routes').then((r) => r.featuresRoutes),
            },
            {
                path: 'users',
                loadComponent: () => import('../users/user/user.component').then((c) => c.UserComponent),
            },
            {
                path: 'chatbot',
                loadComponent: () => import('../chatbot/chatbot.component').then((c) => c.ChatbotComponent),
            },
        ],
        canActivate: [CanActivateRouteGuard],
    },
];
