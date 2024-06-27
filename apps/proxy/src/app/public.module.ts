// my-public-module.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'register', pathMatch: 'full' },
    {
        path: 'register',
        loadChildren: () => import('./register/register.module').then((p) => p.RegisterModule),
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
    providers: [],
    exports: [RouterModule],
})
export class PublicModule {}
