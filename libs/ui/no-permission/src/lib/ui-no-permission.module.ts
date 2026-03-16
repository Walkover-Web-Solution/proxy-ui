import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NoPermissionComponent } from './no-permission/no-permission.component';

@NgModule({
    imports: [CommonModule, MatCardModule],
    exports: [NoPermissionComponent],
    declarations: [NoPermissionComponent],
})
export class UiNoPermissionModule {}
