import {
    ChangeDetectionStrategy,
    Component,
    Input,
    Output,
    EventEmitter,
    inject,
    computed,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetThemeService } from '../../service/widget-theme.service';
import { THEME_COLORS, WIDGET_LAYOUT } from '../theme.constants';
import { FeatureServiceIds } from '@proxy/models/features-model';
import { InputFields, WidgetVersion } from '../utility/model';

@Component({
    selector: 'proxy-auth-buttons',
    imports: [CommonModule],
    templateUrl: './auth-buttons.component.html',
    styleUrls: ['./auth-buttons.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthButtonsComponent implements OnChanges {
    @Input() buttons: any[] = [];
    @Input() version: string = WidgetVersion.V1;
    @Input() inputFields: string = InputFields.TOP;
    @Input() showIconsOnly: boolean = false;
    @Input() borderRadius: string = '8px';
    @Input() otpButtonVisible: boolean = false;

    @Output() buttonClicked = new EventEmitter<any>();

    private readonly themeService = inject(WidgetThemeService);

    readonly isDark = computed(() => this.themeService.isDark$());

    readonly FeatureServiceIds = FeatureServiceIds;
    readonly WidgetVersion = WidgetVersion;
    readonly InputFields = InputFields;

    get buttonBorder(): string {
        return this.isDark() ? THEME_COLORS.dark.buttonBorder : THEME_COLORS.light.buttonBorder;
    }

    get buttonBorderIconOnly(): string {
        return this.isDark() ? THEME_COLORS.dark.buttonBorderIconOnly : THEME_COLORS.light.buttonBorderIconOnly;
    }

    get buttonText(): string {
        return this.isDark() ? THEME_COLORS.dark.buttonText : THEME_COLORS.light.buttonText;
    }

    get useDiv(): boolean {
        return this.version !== WidgetVersion.V1;
    }

    get buttonWidth(): string {
        return this.useDiv ? WIDGET_LAYOUT.widthV2 : WIDGET_LAYOUT.widthV1;
    }

    readonly layout = WIDGET_LAYOUT;

    isOtpButton(btn: any): boolean {
        return btn?.service_id === FeatureServiceIds.Msg91OtpService;
    }

    shouldInvertIcon(btn: any): boolean {
        const isApple = btn?.text?.toLowerCase()?.includes('apple');
        const isPassword = btn?.service_id === FeatureServiceIds.PasswordAuthentication;
        return this.isDark() && (isApple || isPassword);
    }

    onButtonClick(btn: any): void {
        this.buttonClicked.emit(btn);
    }

    ngOnChanges(_changes: SimpleChanges): void {}
}
