// my-public-module.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ServicesHttpWrapperNoAuthModule } from '@proxy/services/http-wrapper-no-auth';

const routes: Routes = [
    { path: '', redirectTo: 'register', pathMatch: 'full' },
    {
        path: 'register',
        loadChildren: () => import('./register/register.module').then((p) => p.RegisterModule),
    },
    {
        path: 'block-registration',
        loadChildren: () =>
            import('./block-registration/block-registration.module').then((p) => p.BlockRegistrationModule),
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes), ServicesHttpWrapperNoAuthModule],
    providers: [],
    exports: [RouterModule],
})
export class PublicModule {}
