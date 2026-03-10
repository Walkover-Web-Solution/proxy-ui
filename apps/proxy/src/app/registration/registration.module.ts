import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './registration.component';

const routes: Routes = [
    {
        path: '',
        component: RegistrationComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [RegistrationComponent],
    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RegistrationModule {}
