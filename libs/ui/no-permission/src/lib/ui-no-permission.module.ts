import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { NoPermissionComponent } from './no-permission/no-permission.component';

@NgModule({
    imports: [CommonModule, MatCardModule],
    exports: [NoPermissionComponent],
    declarations: [NoPermissionComponent],
})
export class UiNoPermissionModule {}
