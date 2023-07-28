export interface IOTPTemplateResponse {
    id: string;
    user_id: string;
    sender_id: string;
    template_id: string;
    template_name: string;
    template: string;
    email_template_id: string;
    approved_date: string;
    company_name: string;
    approved_operators: string;
    rejected_operators: string;
    country_code: string;
    created_date: string;
    content_type: string;
    user_data: string;
    created_by: string;
    voice_template_id: string;
    push_payload_id: string;
    DLT_TE_ID: string;
    variables?: string[];
}

export interface IReportSummary {
    dateWiseData:
        | {
              [key: string]: {
                  SUM: {
                      Total: number;
                      Rejected: number;
                      Delivered: number;
                      Failed: number;
                      AutoFailed: number;
                      NDNC: number;
                      Block: number;
                      BalanceDeducted: number;
                      AvgDeliveryTime: number;
                  };
              };
          }
        | string
        | null;
    totalSumStatusWise: {
        Message: number;
        Filtered: number;
        Delivered: number;
        TotalCredits: number;
        AvgDeliveryTime: number;
    };
    creditToWalletConvertedDate: any;
}

export interface ICreateOtpTemplateReq {
    dltTemplateId: string;
    senderId: string;
    template: string;
    templateName: string;
}

export interface IUpdateOtpTemplateReq extends ICreateOtpTemplateReq {
    templateId: string;
}
