import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

/** Shell for the operator "Team & access" area: members, roles and API keys of the current workspace. */
@Component({
    selector: 'proxy-team',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, RouterLinkActive, RouterOutlet, MatTabsModule],
    templateUrl: './team.component.html',
    styleUrl: './team.component.scss',
})
export class TeamComponent {
    protected readonly tabs = [
        { path: 'members', label: 'Members' },
        { path: 'roles', label: 'Roles' },
        { path: 'api-keys', label: 'API keys' },
    ];
}
