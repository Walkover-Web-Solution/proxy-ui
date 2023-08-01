import { RouterModule, Routes } from "@angular/router";
import { LogComponent } from "./log/log.component";
import { NgModule } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CommonModule } from "@angular/common";
import { UiComponentsSearchModule } from "@msg91/ui/search";
import { MatSelectModule } from "@angular/material/select";
import { UiDateRangePickerModule } from "@msg91/date-range-picker";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTableModule } from "@angular/material/table";
import { ServicesProxyLogsModule } from "@proxy/services/proxy/logs";


const routes: Routes = [
    {
        path: '',
        component: LogComponent,
        data: { title: 'Logs' },
        pathMatch: 'full',
    }
];

@NgModule({
    declarations: [LogComponent],
    imports: [
        FormsModule,
        CommonModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatMenuModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        UiComponentsSearchModule,
        UiDateRangePickerModule,
        ServicesProxyLogsModule
    ],
    exports: [RouterModule],
})
export class LogsModule {}
