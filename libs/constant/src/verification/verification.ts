export enum PublicScriptType {
    Authorization = 'authorization',
    UserDetails = 'user-details', // Default
    UserManagement = 'user-management',
    OrganizationDetails = 'organization-details',
    Subscription = 'subscription',
}

export enum PublicScriptTheme {
    System = 'system',
    Light = 'light',
    Dark = 'dark',
}

export type WidgetConfig = {
    referenceId: string;
    authToken: string;
    type: PublicScriptType;
    showCompanyDetails?: boolean;
    isHidden?: boolean;
    theme?: PublicScriptTheme;
    isPreview?: boolean;
    isLogin?: boolean;
    loginRedirectUrl?: string;
    target?: '_self' | '_blank';
    success?: (data: unknown) => void;
    failure?: (error: unknown) => void;
};

export const VERIFICATION_STATUS = {
    KYC: {
        REQUESTED: 'requested',
        EXPIRED: 'expired',
        REJECTED: 'rejected',
        APPROVED: 'approved',
    },
    IDENTITY: {
        APPROVED: 'approved',
        PENDING: 'pending',
    },
};

export const VERIFICATION_MODE = {
    KYC: '1',
    MANUAL: '2',
};
