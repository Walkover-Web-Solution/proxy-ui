import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { UiLoaderModule } from '@msg91/ui/loader';
import { ServicesProxyAuthModule } from '@proxy/services/proxy/auth';

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
    ],
    exports: [RouterModule],
})
export class AuthModule {}
