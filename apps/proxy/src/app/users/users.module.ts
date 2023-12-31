import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { UiComponentsSearchModule } from '@proxy/ui/search';
import { UiDateRangePickerModule } from '@proxy/date-range-picker';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ServicesProxyLogsModule } from '@proxy/services/proxy/logs';
import { UiNoRecordFoundModule } from '@proxy/ui/no-record-found';
import { DirectivesRemoveCharacterDirectiveModule } from '@proxy/directives/RemoveCharacterDirective';
import { UiMatPaginatorGotoModule } from '@proxy/ui/mat-paginator-goto';
import { UserComponent } from './user/user.component';
import { ServicesProxyUsersModule } from '@proxy/services/proxy/users';
import { DirectivesSkeletonModule } from '@proxy/directives/skeleton';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    declarations: [UserComponent],
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
        MatIconModule,
        MatTableModule,
        UiDateRangePickerModule,
        ServicesProxyLogsModule,
        UiNoRecordFoundModule,
        UiMatPaginatorGotoModule,
        UiComponentsSearchModule,
        DirectivesRemoveCharacterDirectiveModule,
        ServicesProxyUsersModule,
        DirectivesSkeletonModule,
    ],
    exports: [RouterModule],
})
export class UsersModule {}
