import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { UiLoaderModule } from '@proxy/ui/loader';
import { MatIconModule } from '@angular/material/icon';
import { CreateFeatureComponent } from './create-feature.component';
import { ServicesProxyFeaturesModule } from '@proxy/services/proxy/features';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

const routes: Routes = [
    {
        path: '',
        component: CreateFeatureComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [CreateFeatureComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        UiLoaderModule,
        MatStepperModule,
        MatListModule,
        ServicesProxyFeaturesModule,
        MatChipsModule,
    ],
    exports: [RouterModule],
})
export class CreateFeatureModule {}
