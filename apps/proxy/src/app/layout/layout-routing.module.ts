import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { CanActivateRouteGuard } from '../auth/authguard';
import { redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { ProjectGuard } from '../guard/project.guard';
import { ChatbotComponent } from '../chatbot/chatbot.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'logs', pathMatch: 'full' },
            {
                path: 'logs',
                loadChildren: () => import('../logs/logs.module').then((p) => p.LogsModule),
            },
            {
                path: 'features',
                loadChildren: () => import('../features/features.module').then((p) => p.FeaturesModule),
            },
            {
                path: 'users',
                loadChildren: () => import('../users/users.module').then((p) => p.UsersModule),
            },
            {
                path: 'chatbot',
                component: ChatbotComponent,
            },
        ],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [CanActivateRouteGuard, ProjectGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LayoutRoutingModule {}
