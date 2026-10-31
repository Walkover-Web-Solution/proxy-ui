import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiSettingsService } from '../ui-settings.service';
import { isThemePreference } from '../theme-preference';

@Component({
    selector: 'proxy-theme-switcher',
    templateUrl: './theme-switcher.component.html',
    styleUrl: './theme-switcher.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonToggleModule, MatIconModule, MatTooltipModule],
})
export class ThemeSwitcherComponent {
    private readonly uiSettings = inject(UiSettingsService);
    readonly preference = this.uiSettings.themePreference;

    protected select(value: unknown): void {
        if (isThemePreference(value)) {
            this.uiSettings.setThemePreference(value);
        }
    }
}
