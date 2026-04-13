import { Route } from '@angular/router';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { CanActivateRouteGuard } from '../website/home/authguard';
import { ProjectGuard } from './guard/project.guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const panelRoutes: Route[] = [
    {
        path: 'app',
        loadComponent: () => import('./layout/layout.component').then((c) => c.LayoutComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'logs',
                loadChildren: () => import('./logs/logs.routes').then((r) => r.logsRoutes),
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./dashboard/dashboard.component').then((c) => c.DashboardComponent),
            },
            {
                path: 'features',
                loadChildren: () => import('./features/features.routes').then((r) => r.featuresRoutes),
            },
            {
                path: 'users',
                loadComponent: () => import('./users/user/user.component').then((c) => c.UserComponent),
            },
            {
                path: 'chatbot',
                loadComponent: () => import('./chatbot/chatbot.component').then((c) => c.ChatbotComponent),
            },
        ],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [CanActivateRouteGuard, ProjectGuard],
    },
    {
        path: 'widget-preview/:referenceId',
        loadComponent: () =>
            import('./features/create-feature/feature-preview/widget-preview/widget-preview.component').then(
                (c) => c.WidgetPreviewComponent
            ),
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard],
    },
    {
        path: 'project',
        loadComponent: () => import('./create-project/create-project.component').then((c) => c.CreateProjectComponent),
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard],
    },
    {
        path: 'client',
        children: [
            {
                path: 'registration',
                loadComponent: () =>
                    import('../core/registration/registration.component').then((c) => c.RegistrationComponent),
            },
        ],
    },
];
