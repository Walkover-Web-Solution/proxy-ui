import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DirectivesMarkAllAsTouchedModule } from '@proxy/directives/mark-all-as-touched';
import { UsersService } from '@proxy/services/proxy/users';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

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
        MatCardModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule.forChild(routes),
        DirectivesMarkAllAsTouchedModule,
    ],
    providers: [UsersService],
    exports: [RouterModule],
})
export class RegisterModule {}
