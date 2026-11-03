import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IFirebaseUserModel } from '@proxy/models/root-models';
import { SideNavService } from '../side-nav.service';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';

@Component({
    selector: 'proxy-sidebar-user-menu',
    templateUrl: './sidebar-user-menu.component.html',
    styleUrl: './sidebar-user-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatMenuModule, MatButtonModule, MatIconModule, MatTooltipModule, ThemeSwitcherComponent],
})
export class SidebarUserMenuComponent {
    @Input({ required: true }) user!: IFirebaseUserModel;
    @Output() loggedOut = new EventEmitter<void>();

    public sideNavService = inject(SideNavService);
}
