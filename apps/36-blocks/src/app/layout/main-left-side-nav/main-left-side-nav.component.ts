import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-main-left-side-nav',
    imports: [
        RouterModule,
        MatMenuModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatExpansionModule,
        MatTooltipModule,
    ],
    templateUrl: './main-left-side-nav.component.html',
    styleUrls: ['./main-left-side-nav.component.scss'],
})
export class MainLeftSideNavComponent extends BaseComponent {
    public isSideNavOpen = input<boolean>();

    protected readonly navItems = [
        { route: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
        { route: 'features', icon: 'featured_play_list', label: 'Blocks' },
        { route: 'users', icon: 'person', label: 'User' },
        { route: 'logs', icon: 'description', label: 'Logs' }, //  Temporary hide this page
        { route: 'chatbot', icon: 'face', label: 'Ask Ai' },
    ];
}
