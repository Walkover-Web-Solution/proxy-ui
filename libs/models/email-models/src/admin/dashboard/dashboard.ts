export interface IEmailGetReportEventWiseResModel {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    delivery_status_count: number;
}

export interface IEmailGraphReqModel {
    from_date_time: string;
    to_date_time: string;
}

export interface IEmailGraphDataResModel {
    labels: string[];
    data: IEmailGraphData;
}

export interface IEmailGraphData {
    Queued: number[];
    Accepted: number[];
    Rejected: number[];
    Delivered: number[];
    Opened: number[];
    Unsubscribed: number[];
    Clicked: number[];
    Bounced: number[];
    Failed: number[];
    Complaints: number[];
}

export interface IAdminDashboardEmailReports {
    Queued: number;
    Accepted: number;
    Rejected: number;
    Delivered: number;
    Opened: number;
    Unsubscribed: number;
    Clicked: number;
    Bounced: number;
    Failed: number;
    Complaints: number;
    emailTotalCount: number;
}
