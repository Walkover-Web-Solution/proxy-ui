export interface ICurrency {
    id: number;
    name: string;
    short_name: string;
    slug: string;
}

export type NameId = {
    id: number;
    name: string;
};

export interface IMicroservice {
    id: number;
    name: string;
}

export interface IService {
    id: number;
    name: string;
    microservice_id: number;
    service_credit_rates?: Array<any>;
}

export enum BillingPlanType {
    Monthly = 'Monthly',
    Quarterly = 'Quarterly',
    HalfYearly = 'Half yearly',
    Yearly = 'Yearly',
    BiYearly = 'Bi yearly',
}

export interface IClientModel {
    id: number;
    name: string;
    panel_user_id: number;
    total_outstanding: number;
    next_balance: number;
    company_plans: ICompanyPlanModel[];
}

export interface ICompanyPlanModel {
    id: number;
    company_id: number;
    subscription_date: Date;
    renewal_date: Date;
    end_date: Date | null;
    is_active: number;
    deleted_at: null;
    plan_amount_id: number;
    plan_amount: IPlanAmountModel;
}

export interface IPlanAmountModel {
    id: number;
    plan_id: number;
    plan_amount: number;
    plan_type_id: number;
    currency_id: number;
    plan: IPlanModel;
    currency: ICurrency;
}

export interface IPlanModel {
    id: number;
    name: string;
    is_public: number;
    is_active: number;
    deleted_at: null;
    microservice_id: number;
    sequence: number;
    slug: string;
}

export interface IClientOperation {
    code: string;
    parameters: {
        column: string;
        operator: string;
        value: string;
    };
}
export interface IGetClientsReq {
    cl_id?: string;
    cl_name?: string;
    p_id?: string;
    curr_id?: string;
    order_by?: string;
    order_type?: string;
    operations?: IClientOperation[];
}

export interface IDiscount {
    id: number;
    type: string;
}

export interface IClientSubscriptionDetails {
    id: number;
    company_id: number;
    plan_name: string;
    subscription_date: string;
    renewal_date: string;
    last_renewal_date: string;
    end_date: string;
    discountType: string;
    discount: number;
    extra: number;
    extraType: string;
    amount: number;
    currency: string;
    microservice: string;
    planId: number;
    planTypeId: number;
    currencyId: number;
    panelUserId: number;
    isActive: boolean;
    actionsAllowed: boolean;
    meta: {
        did_no: string;
        integrated_no: string;
    };
}

export interface IPlanAmountFormatted {
    id: number;
    plan_type_id: number;
    plan_id: number;
    plan_amount: number;
    plan_type: string;
    values: Array<{ amount: number; currency_code: string; dial_plan_id?: number }>;
}

export interface IPlanAmount {
    id: number;
    plan_id: number;
    plan_amount: number;
    plan_type_id: number;
    currency_id: number;
    currency: {
        short_name: string;
    };
    plan_type: {
        id: number;
        name: string;
        no_of_days: number;
    };
}

export interface IServiceCreditRate {
    currency: ICurrency;
    follow_up_rate: number;
    free_credits?: number;
}

export interface IPlanServiceCredit {
    id: number;
    name: string;
    service_id: number;
    free_credits: number;
    service: {
        name: string;
        support_dial_plan?: 1 | 0;
    };
    pivot: {
        plan_id: number;
        service_credit_id: number;
    };
    service_credit_rates: Array<IServiceCreditRate>;
}

// export interface IBillingPlan {
//     id: number;
//     name: string;
//     is_public: number;
//     is_active: number;
//     deleted_at: null | string;
//     microservice_id: number;
//     sequence: number;
//     slug: string;
//     microservice: {
//         id: number;
//         name: string;
//     };
//     service_credits: IPlanServiceCredit[];
//     service_credits_info?: Array<any>;
//     plan_amounts: IPlanAmount[] | IPlanAmountFormatted[];
// }

export interface IFetchUpgradeDowngradePlansReq {
    old_p_id: number;
    old_p_amt: number;
    action: string;
    old_p_type: number;
}
export interface IModifySubscriptionReq {
    panel_user_id: number;
    plan_id: number;
    plan_amount: number;
    overusage_limit_user: number;
    new_sub_date: string;
    action: 'upgrade' | 'downgrade' | 'reactivate' | 'deactivate';
    old_p_id: number;
    old_p_amt: number;
    curr_id: number;
}

export interface IModifySubscriptionStatusReq {
    action: string;
    company_plan_id: number;
    subscriptionId?: number;
}

export interface ICalculateProRatedReq {
    plan_id: number;
    plan_amount: number;
    discount: number;
    disc_type_id: number;
    curr_id: number;
    panel_user_id?: string;
}

export interface IPaymentLogsReq {
    search?: string;
    order_by?: string;
    order_type?: string;
    status?: string;
    with?: string;
    page?: number;
    per_page?: number;
    date_to?: string;
    date_from?: string;
    operations?: any;
}

export interface IPaymentLogs {
    id: number;
    created_at: string;
    updated_at?: string;
    company_plan_id: string | null;
    panel_user_id: number;
    client_name: string;
    microservice: string;
    amount: number;
    services: string;
    action: string;
    description: string;
    status: number;
    request: string;
    response: string;
    company_plan: ISubscriptionResModel;
}

export interface ISubscriptionResModel {
    id: number;
    company_id: number;
    subscription_date: Date;
    renewal_date: Date;
    end_date: null;
    is_active: number;
    deleted_at: null;
    plan_amount_id: number;
    plan_amount: any;
    expire?: boolean;
    last_renewal_date?: Date;
    meta: any;
}

export interface IPaginatedPaymentLogsResponse<P> {
    data: P;
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string;
    path: string;
    per_page: number;
    prev_page_url: null | string;
    to: number;
    total: number;
}

export interface IPagination {
    per_page: number;
    total: number;
    current_page: number;
}

export interface Pagination {
    per_page: number;
    total: number;
    current_page: number;
}
export interface SubscriptionClient {
    id: number;
    name: string;
    email?: string;
    contact?: number;
    planCount?: number;
}
export interface SubscriptionPlanService {
    name: string;
    consumption: number;
    extra: Array<SubscriptionAddons>;
}
export interface SubscriptionPlanAmounts {
    name: string;
    plan_amount: number;
}
export interface SubscriptionPlan {
    id: number;
    name: string;
    services: Array<SubscriptionPlanService>;
    currency: string;
    rates?: Array<any>;
    isPublic: boolean;
    microserviceName: string;
    amount: number;
    overusage_limit_admin: number;
    overusage_limit_user: number;
    types: Array<SubscriptionPlanAmounts>;
}
export interface SubscriptionAddons {
    type: 'Fixed' | 'Percentage' | 'Extra';
    value: number;
}
export interface Subscription {
    id: number;
    client: SubscriptionClient;
    plan: SubscriptionPlan;
    startDate: string;
    renewalDate?: string;
    endDate?: string;
    consumption: Array<any>;
    discounts: Array<SubscriptionAddons>;
    extras: Array<SubscriptionAddons>;
}

export interface IEmailGetAllServicesReqModel {
    with: string;
    event_id: string;
}

export interface ServiceCreditRate {
    id: number;
    service_credit_id: number;
    follow_up_rate: number;
    currency_id: number;
    currency: ICurrency;
}

export interface IAdminGetAllServicesCreditsResModel {
    id: number;
    name: string;
    service_id: number;
    free_credits: number;
    service_credit_rates: ServiceCreditRate[];
    service: IService;
}
export interface IAdminServicesTypeResModel {
    id: number;
    name: string;
    microservice_id: number;
}

export interface ICreateServiceCurrencyReq {
    currency_id: number;
    follow_up_rate: number;
}

export interface IAdmminServicesCurrenciesResModel {
    id: number;
    name: string;
    short_name: string;
    slug: string;
    free_credits?: number;
}

export interface IAdminServicesCreateModel {
    service_id: number;
    free_credits: number;
    name: string;
    currencies: ICurrency[];
}

export interface IServiceOperation {
    code: string;
    relation?: string;
    currency_id?: number;
    parameters: {
        column: string;
        operator: string;
        value: string;
    };
}
export interface IAdmminServicesRequest {
    service?: string;
    order_by?: string;
    service_id?: string;
    order_type?: string;
    operations?: Array<IServiceOperation>;
}

export interface IAdminServiceRequest {
    service_id: number;
    free_credits: number;
    name: string;
    id?: number;
    currencies: Array<ICreateServiceCurrencyReq>;
}

export interface IPlanCreateReq {
    name: string;
    sequence: number;
    microservice_id: number;
    is_public: number;
    services: { service_credit_id: number }[];
    plan_types: IPlanCreateType[];
    dial_plan_id?: number;
    valid_currencies: string[];
}

export interface IPlanCreateType {
    plan_type_id: number;
    plan_amount: number;
    currency_id: number;
    dial_plan_id?: number;
}

export interface IPlanUpdateReq {
    name: string;
    sequence?: number;
    is_public: number;
    id: number;
    plan_types: IPlanCreateType[];
    services: { service_credit_id: number }[];
}

export interface IPaginatedPlanResponse<P> {
    data: P;
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string;
    path: string;
    per_page: number;
    prev_page_url: null | string;
    to: number;
    total: number;
}

export interface IBillingPlan {
    id: number;
    name: string;
    is_public: number;
    is_active: number;
    deleted_at: null | string;
    microservice_id: number;
    sequence: number;
    slug: string;
    microservice: {
        id: number;
        name: string;
    };
    service_credits: IPlanServiceCredit[];
    service_credits_info?: Array<any>;
    plan_amounts: IPlanAmount[] | IPlanAmountFormatted[];
    valid_currencies?: string[];
}

export interface IServiceCreditRate {
    currency: ICurrency;
    follow_up_rate: number;
}

export interface IPlanServiceCredit {
    id: number;
    name: string;
    service_id: number;
    free_credits: number;
    service: {
        name: string;
        support_dial_plan?: 1 | 0;
    };
    pivot: {
        plan_id: number;
        service_credit_id: number;
    };
    service_credit_rates: Array<IServiceCreditRate>;
}

export interface IPlanAmount {
    id: number;
    plan_id: number;
    plan_amount: number;
    plan_type_id: number;
    currency_id: number;
    currency: {
        short_name: string;
    };
    plan_type: IPlanType;
    dial_plan_id?: number;
}

export interface IFetchPlanReq {
    with?: string;
    slug?: string;
    name?: string;
    sequence?: string;
    service_ids?: number[];
    is_public?: number;
    ms_id?: number;
    operations: IFetchPlanOperator[];
    page?: number;
    per_page?: number;
}

export interface IFetchPlanOperator {
    code: string;
    relation: string;
    plan_type: string;
    parameters: {
        column: string;
        operator: '=' | '<' | '>';
        value: string;
    };
}

export interface IPagination {
    per_page: number;
    total: number;
    current_page: number;
}

export interface IPlanType {
    id: number;
    name: string;
    no_of_days: number;
}

export enum ServiceIds {
    inboundVoice = 5,
    inboundSMS = 6,
}
export interface IBuyPlanReq {
    panel_user_id: number;
    c_name: string;
    plan_id: number;
    plan_amount: number;
    overusage_limit_user?: number;
    curr_id: number;
    microservice: string;
    did_no?: string;
    did_no_id?: number;
    integrated_no?: string;
}

export const CURRENCIES = {
    inr: { symbol: '₹', currency_id: 1, name: 'INR' },
    usd: { symbol: '$', currency_id: 2, name: 'USD' },
    gbp: { symbol: '£', currency_id: 3, name: 'GBP' },
};

export enum PlanTypeDuration {
    // DAILY = 1,
    MONTHLY = 1,
    QUARTERLY = 2,
    HALY_YEARLY = 3,
    YEARLY = 4,
}

export interface IMicroserviceType {
    id: number;
    name: string;
}

export interface ITransactionLog {
    Time: string;
    Transfer: string;
    Credits: string;
    Price: string;
    Amount: string;
    Description: string;
    Type: string;
    Status: string;
}

export interface ITransactionLogsRes {
    data: ITransactionLog[];
    totalCount: string;
}

export interface ITransactionLogsReq {
    pageNo?: string;
    limit?: string;
    type?: string;
    isExport?: number;
    startDate?: string;
    endDate?: string;
    getTotalCount?: number;
}

export interface ILedgerMagicLinkRes {
    previousSession: string;
    currentSession: string;
}

export interface ISubscriptionOperationPermissionAdminResModel {
    created_at: string;
    deleted_at: string;
    id: number;
    is_enabled: number;
    meta: { permissions: string[] };
    name: string;
    panel_id: number;
    panel_user_id: number;
    role_id: number;
    updated_at: string;
    currency_id: number;
    firebase_uid: string;
    firebase_token: number;
    grace_period: number;
}
export interface ISubscriptionOperationPermissionAdminReqModel {
    per_page: number;
    page?: number;
    name?: string;
}

export interface IProratedAmount {
    net_amount: IProratedAmountNetAmount;
    renewal_date: string;
    total_amount: number;
    unsettled_amount: IProratedAmountUnsettledAmount;
    benefits_included: {
        services: { [key: string]: string };
    };
}

export interface IProratedAmountNetAmount {
    active_days: number;
    already_paid: number;
    net_amount: number;
    new_net_amount: number;
    new_plan_amount: number;
    per_day_amount: number;
}

export interface IProratedAmountUnsettledAmount {
    services?: IProratedAmountServiceWiseUnsettledAmount[];
    total_extra: number;
}

export interface IProratedAmountServiceWiseUnsettledAmount {
    extra_amount: number;
    extra_credits: number;
    follow_up_rate: number;
    service_name: string;
}
