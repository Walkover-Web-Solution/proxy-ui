export const WIDGET_LAYOUT = {
    widthV2: '316px',
    widthV1: '260px',
    gutterH: '8px',
    fontFamily: "'Inter', sans-serif",
    buttonHeight: '44px',
    buttonFontSize: '14px',
    buttonMargin: '8px 8px 16px 8px',
    iconSizeLarge: '24px',
    iconSizeSmall: '20px',
    iconOnlyGap: '35px',
    inputHeight: '44px',
    formGap: '8px',
} as const;

export const THEME_COLORS = {
    dark: {
        buttonText: '#ffffff',
        buttonBorder: '1px solid #ffffff',
        buttonBorderIconOnly: '1px solid #ffffff',
        poweredByLabel: '#9ca3af',
        logoText: '#F8F8F8',
        primaryColorFallback: '#FFFFFF',
    },
    light: {
        buttonText: '#111827',
        buttonBorder: '1px solid #000000',
        buttonBorderIconOnly: '1px solid #d1d5db',
        poweredByLabel: '#6b7280',
        logoText: '#1a1a1a',
        primaryColorFallback: '#000000',
    },
} as const;
