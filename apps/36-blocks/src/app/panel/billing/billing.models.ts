export interface IBillingPlanPrice {
    amount?: number;
    display?: string;
    currency?: string;
    interval?: string;
}

export interface IBillingPlanFrontendData {
    price?: IBillingPlanPrice;
    tagline?: string;
    features?: string[];
    display_name?: string;
    highlight?: boolean;
    is_popular?: boolean;
    badge?: string;
    cta?: string;
    cta_style?: 'primary' | 'outline';
}

export interface IBillingPlanLimits {
    monthly_active_users?: string;
    mau?: string;
    blocks?: string;
    log_retention_days?: string;
    session_duration_hours?: string;
    email_authentication?: string;
    sms?: string;
    custom_branding?: string;
    branding_removable?: string;
    auto_multi_org?: string;
    advanced_org_rules?: string;
    [key: string]: string | undefined;
}

export interface IBillingPlan {
    id: number;
    name: string;
    lago_plan_code: string;
    is_internal: boolean;
    frontend_data?: IBillingPlanFrontendData;
    limits?: IBillingPlanLimits;
}

export interface IBillingSubscriptionStatus {
    has_subscription: boolean;
    status: string;
    active_plan_code: string | null;
    pending_plan_code: string | null;
    started_at: string | null;
    ending_at: string | null;
}

export interface IBillingUpgradeRequest {
    plan_code: string;
}

export interface IBillingUpgradeCustomer {
    checkout_url?: string | null;
}

export interface IBillingCheckoutResponse {
    requires_payment_method?: boolean;
    checkout_url: string | null;
    raw?: {
        customer?: IBillingUpgradeCustomer;
    };
}

export type IBillingUpgradeResponse = IBillingCheckoutResponse;
export type IBillingAddPaymentMethodResponse = IBillingCheckoutResponse;

export interface IBillingPaymentMethodCard {
    brand?: string;
    display_brand?: string;
    exp_month?: number;
    exp_year?: number;
    last4?: string;
}

export interface IBillingPaymentMethod {
    id: string;
    type: string;
    is_default: boolean;
    card?: IBillingPaymentMethodCard;
    billing_details?: {
        name?: string | null;
        email?: string | null;
    };
}

export interface IBillingPaymentMethodsResponse {
    payment_methods: IBillingPaymentMethod[];
}

export interface IBillingSetDefaultPaymentMethodRequest {
    payment_method_id: string;
}

export interface IBillingUsagePlan {
    code: string;
    name: string;
}

export interface IBillingUsagePeriod {
    from: string | null;
    to: string | null;
}

export interface IBillingUsageMetric {
    code: string;
    name: string;
    unit: string;
    current_usage: number;
    limit: number | null;
    limit_display: string | null;
    is_unlimited: boolean;
    percent_used: number;
}

export interface IBillingSubscriptionUsage {
    fetched_successfully: boolean;
    source: string;
    message: string | null;
    plan: IBillingUsagePlan;
    period: IBillingUsagePeriod;
    metrics: IBillingUsageMetric[];
}
