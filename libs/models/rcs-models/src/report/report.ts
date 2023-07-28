export interface IReportReqModel {
    from_date: Date;
    to_date: Date;
}

export interface IReportRespModel {
    success_report: IReportModel[];
    client_disabled_report: IReportModel[];
    other_failure_report: IReportModel[];
}

export interface IReportPercentageRespModel {
    delivered: { count: number; percentage: number };
    failed: { count: number; percentage: number };
    read: { count: number; percentage: number };
    sent: { count: number; percentage: number };
    submitted: { count: number; percentage: number };
    total: number;
}

export interface IRCSReportPercentageRespModel {
    RCS_not_enabled_failure: { count: number; percentage: number };
    delivered: { count: number; percentage: number };
    low_balance_or_something_else_failure: { count: number; percentage: number };
    total: number;
}

export interface IReportModel {
    date: string;
    count: number;
}
