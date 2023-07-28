export interface IRecipientValidation {
    _id: string;
    user_id: number;
    count: number;
    status: number;
    is_bulk: boolean;
    created_at: string;
    updated_at: string;
    result?: IValidationResult;
    summary?: IValidationSummary;
    email: string;
    statisticsData?: { name: string; value: number }[];
    progressBar?: { name: string; value: number }[];
}

export interface IValidationSummary {
    deliverable: number;
    undeliverable: number;
    neutral: number;
    risky: number;
    typo: number;
    unknown: number;
    total?: number;
}

export interface IValidationResult {
    valid: boolean;
    result: string;
    is_role: boolean;
    is_disposable: boolean;
    is_free: boolean;
    delivery_confidence: number;
}

export interface ISingleMailValidationReq {
    email: string;
}

export interface IBulkMailValidationReq {
    emails: string[];
    name: string;
}

export interface IRecipientValidationReq {
    from_date_time: string;
    to_date_time: string;
    per_page: number;
    page: number;
    bulk_request: boolean;
}

export interface IValidationTerminology {
    [key: string]: string;
}
