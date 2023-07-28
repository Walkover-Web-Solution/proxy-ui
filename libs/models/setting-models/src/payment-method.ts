export interface PriceListReqModel {
    country: string;
    currency: string;
    amount: string;
}

export interface PriceListResModel {
    rate: string;
    tax: string;
    no_sms: string;
}

export interface MakeOrderReqModel {
    payment: string;
    net_amount: string;
    amount: number;
    tax: string;
    tax_percentage: number;
    tds_percentage: number;
    tds_amount: number;
}

export type bankDetailReq = Pick<MakeOrderReqModel, 'payment'>;

export interface MakeOrderResModel {
    payment: string;
    order_id: string;
}
export interface MakePaymentReqModel {
    payment: string;
    transaction_id: string;
    order_id: string;
    net_amount: string;
    response_msg: any;
    gateway_response: any;
    bill_details: BillDetails;
    amount: number;
    tax: string;
    tax_percentage: number;
}

export interface BillDetails {
    name: string;
    number: string;
    email: string;
    company: string;
    gst_no: string;
    country_short_name?: string;
    country_code: number;
    country: string;
    state: string;
    city: string;
    pincode: string;
    address: string;
}

export interface RazorpaySuccessResModel {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface ExtraDiscount {
    Promotional: string;
    Transactional: string;
    Email?: string;
    OTP: string;
    'Promotional Numeric': string;
    Wallet: string;
    totalExtraBalance: string;
}
export interface ExtraBenefitResModel {
    userSignupDate: string;
    firstPurchase: number;
    currency: string;
    currencyIcon: string;
    extraDiscounts: ExtraDiscount;
}

export interface CountrySlabPriceReqModel {
    country: string;
    amount: number;
}

export interface StripeAddSubscriptionReqModel {
    minBalance: string;
    amountCharge: string;
    bill_details: BillDetails;
}
