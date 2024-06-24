// register.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DirectivesMarkAllAsTouchedModule } from '@proxy/directives/mark-all-as-touched';

const routes: Routes = [
    {
        path: '',
        component: RegisterComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [RegisterComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FormsModule,
        MatFormFieldModule,
        MatInputModule,

        RouterModule.forChild(routes),
        DirectivesMarkAllAsTouchedModule,
    ],
    providers: [],
    exports: [RouterModule],
})
export class RegisterModule {}
