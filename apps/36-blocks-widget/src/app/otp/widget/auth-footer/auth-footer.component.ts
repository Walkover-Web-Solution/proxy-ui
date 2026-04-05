import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetThemeService } from '../../service/widget-theme.service';
import { THEME_COLORS, WIDGET_LAYOUT } from '../theme.constants';
import { WidgetVersion } from '../utility/model';

@Component({
    selector: 'proxy-auth-footer',
    imports: [CommonModule],
    templateUrl: './auth-footer.component.html',
    styleUrls: ['./auth-footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthFooterComponent {
    @Input() version: string = WidgetVersion.V1;
    @Input() primaryColor: string = '#000000';
    @Input() signUpButtonText: string = 'Create an account';
    @Input() showCreateAccount: boolean = false;

    @Output() createAccount = new EventEmitter<void>();

    private readonly themeService = inject(WidgetThemeService);

    readonly isDark = computed(() => this.themeService.isDark$());

    get labelColor(): string {
        return this.isDark() ? THEME_COLORS.dark.poweredByLabel : THEME_COLORS.light.poweredByLabel;
    }

    get logoTextColor(): string {
        return this.isDark() ? THEME_COLORS.dark.logoText : THEME_COLORS.light.logoText;
    }

    get containerWidth(): string {
        return this.version === WidgetVersion.V1 ? WIDGET_LAYOUT.widthV1 : WIDGET_LAYOUT.widthV2;
    }

    readonly layout = WIDGET_LAYOUT;

    onCreateAccount(event: Event): void {
        event.preventDefault();
        this.createAccount.emit();
    }
}
