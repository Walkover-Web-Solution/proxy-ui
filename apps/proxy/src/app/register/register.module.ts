import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { RouterModule, Routes } from '@angular/router';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { DirectivesMarkAllAsTouchedModule } from '@proxy/directives/mark-all-as-touched';
import { UsersService } from '@proxy/services/proxy/users';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

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
