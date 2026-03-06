import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BlockRegistrationComponent } from './block-registration.component';

const routes: Routes = [
    {
        path: '',
        component: BlockRegistrationComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [BlockRegistrationComponent],
    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class BlockRegistrationModule {}
