//#region rcs-admin-panel/user/
export interface RcsUser {
    company_id: number;
    display_name: string;
    user_email_id: string;
    user_contact_number: string;
    rcs_status: string;
}

export interface IRcsUserRespModel {
    rcs_users: RcsUser[];
}

//#endregion

//#region rcs-admin-panel/log
export interface DeliveryReport {
    sent_time: string;
    sender: number;
    receiver: string;
    message_type: string;
    status: string;
    failure_reason: string;
}

export interface IDeliveryReportRespModel {
    delivery_report: DeliveryReport[];
}

//#endregion

//#region rcs-admin-panel/report/
export interface SuccessReport {
    date: string;
    count: number;
}

export interface ClientDisabledReport {
    date: string;
    count: number;
}

export interface IReportStatusRespModel {
    success_report: SuccessReport[];
    client_disabled_report: ClientDisabledReport[];
    other_failure_report: any[];
}

//#endregion
