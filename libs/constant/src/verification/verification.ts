export enum PublicScriptType {
    Authorization = 'authorization',
    UserProfile = 'user-profile', // Default
    UserManagement = 'user-management',
    OrganizationDetails = 'organization-details',
    Subscription = 'subscription',
}

export enum WidgetTheme {
    System = 'system',
    Light = 'light',
    Dark = 'dark',
}

export type WidgetConfig = {
    referenceId?: string;
    authToken?: string;
    type?: PublicScriptType;
    showCompanyDetails?: boolean;
    isRolePermission?: boolean;
    theme?: WidgetTheme;
    isPreview?: boolean;
    isLogin?: boolean;
    loginRedirectUrl?: string;
    redirect_path?: string; // Optional: Path to redirect after login (e.g., '/dashboard') only used get proxy_auth_token in admin panel while preview
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

export const PROXY_DOM_ID = 'userProxyContainer';
