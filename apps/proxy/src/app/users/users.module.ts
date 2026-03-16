import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { CommonModule } from '@angular/common';
import { UiComponentsSearchModule } from '@proxy/ui/search';
import { UiDateRangePickerModule } from '@proxy/date-range-picker';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { ServicesProxyLogsModule } from '@proxy/services/proxy/logs';
import { UiNoRecordFoundModule } from '@proxy/ui/no-record-found';
import { DirectivesRemoveCharacterDirectiveModule } from '@proxy/directives/RemoveCharacterDirective';
import { UiMatPaginatorGotoModule } from '@proxy/ui/mat-paginator-goto';
import { UserComponent } from './user/user.component';
import { ServicesProxyUsersModule } from '@proxy/services/proxy/users';
import { ServicesProxyFeaturesModule } from '@proxy/services/proxy/features';
import { DirectivesSkeletonModule } from '@proxy/directives/skeleton';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { UiConfirmDialogModule } from '@proxy/ui/confirm-dialog';
import { ManagementComponent } from './management/management.component';
import { MarkdownModule } from 'ngx-markdown';
import { UiCopyButtonModule } from '@proxy/ui/copy-button';

// Components
const routes: Routes = [
    {
        path: '',
        component: UserComponent,
        data: { title: 'User' },
        pathMatch: 'full',
    },
];

@NgModule({
    declarations: [UserComponent, ManagementComponent],
    imports: [
        FormsModule,
        CommonModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatTabsModule,
        MatSelectModule,
        MatDialogModule,
        MatMenuModule,
        MatDividerModule,
        MatSlideToggleModule,
        UiConfirmDialogModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        UiDateRangePickerModule,
        ServicesProxyLogsModule,
        UiNoRecordFoundModule,
        UiMatPaginatorGotoModule,
        UiComponentsSearchModule,
        DirectivesRemoveCharacterDirectiveModule,
        ServicesProxyUsersModule,
        ServicesProxyFeaturesModule,
        DirectivesSkeletonModule,
        MarkdownModule.forRoot(),
        UiCopyButtonModule,
    ],
    exports: [RouterModule],
})
export class UsersModule {}
