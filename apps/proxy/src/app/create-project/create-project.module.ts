import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateProjectComponent } from './create-project.component';
import { RouterModule, Routes } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { UiCopyButtonModule } from '@proxy/ui/copy-button';
import { LogsService } from '@proxy/services/proxy/logs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CreateProjectService, ServicesProxyCreateProjectModule } from '@proxy/services/proxy/create-project';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DirectivesMarkAllAsTouchedModule } from '@proxy/directives/mark-all-as-touched';

const routes: Routes = [
    {
        path: '',
        component: CreateProjectComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [CreateProjectComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatStepperModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatListModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule,
        MatCardModule,
        ReactiveFormsModule,
        UiCopyButtonModule,
        ServicesProxyCreateProjectModule,
        MatAutocompleteModule,
        MatTooltipModule,
        DirectivesMarkAllAsTouchedModule,
    ],
    providers: [CreateProjectService],
    exports: [RouterModule],
})
export class CreateProjectModule {}
