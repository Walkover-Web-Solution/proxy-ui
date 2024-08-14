import { NgModule } from '@angular/core';
import { CreateEndpointComponent } from './create-endpoint.component';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { UiLoaderModule } from '@proxy/ui/loader';
import { MatListModule } from '@angular/material/list';
import { ServicesProxyFeaturesModule } from '@proxy/services/proxy/features';
import { MatChipsModule } from '@angular/material/chips';
import { MarkdownModule } from 'ngx-markdown';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UiCopyButtonModule } from '@proxy/ui/copy-button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggle, MatButtonToggleModule } from '@angular/material/button-toggle';

const routes: Routes = [
    {
        path: '',
        component: CreateEndpointComponent,
        pathMatch: 'full',
    },
];
@NgModule({
    declarations: [CreateEndpointComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        UiLoaderModule,
        MatCardModule,
        MatSelectModule,

        MatListModule,
        ServicesProxyFeaturesModule,
        MatChipsModule,
        MatCheckboxModule,
        MatButtonToggleModule,

        MatTabsModule,
        MatSlideToggleModule,
        UiCopyButtonModule,
    ],
    exports: [],
})
export class CreateEndpointModule {}
