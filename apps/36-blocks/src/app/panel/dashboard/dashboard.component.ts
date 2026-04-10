import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-dashboard',
    imports: [RouterModule, MatIconModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent extends BaseComponent {}
