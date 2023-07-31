import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
    {
        path: '',
        component: AuthComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [AuthComponent],
    imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, MatCardModule, MatButtonModule],
    exports: [RouterModule],
})
export class AuthModule {}
