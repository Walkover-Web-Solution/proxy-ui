import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateProjectComponent } from './create-project.component';
import { RouterModule, Routes } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { UiCopyButtonModule } from '@proxy/ui/copy-button';
import { LogsService } from '@proxy/services/proxy/logs';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { CreateProjectService, ServicesProxyCreateProjectModule } from '@proxy/services/proxy/create-project';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
