import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { RouterModule, Routes } from '@angular/router';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { UiLoaderModule } from '@proxy/ui/loader';
import { ServicesProxyAuthModule } from '@proxy/services/proxy/auth';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
    {
        path: '',
        component: AuthComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [AuthComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        UiLoaderModule,
        ServicesProxyAuthModule,
        MatIconModule,
    ],
    exports: [RouterModule],
})
export class AuthModule {}
