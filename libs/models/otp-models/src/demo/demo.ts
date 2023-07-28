export interface SendDemoOtpReqModel {
    countryCode: string;
    mobileNumber: string;
}

export interface VerifyDemoOtpReqModel extends SendDemoOtpReqModel {
    otp: string;
}

export interface IOTPWidget {
    widgetId: string;
    name: string;
    widgetType: {
        value: string;
        name: string;
    };
    processType: {
        value: string;
        name: string;
    };
    otpLength: string;
    status: {
        value: string;
        name: string;
    };
    companyId: string;
    lastUpdatedAt: string;
    createdAt: string;
    fromEmail?: string;
    fromName?: string;
    domain?: string;
    domain_id?: string;
    extraDetails?: {
        fromEmail?: string;
        fromName?: string;
        domain?: string;
        domain_id?: string;
        otpVariable?: string;
        otpVariableWhatsApp?: string;
        integrated_number?: string;
        language?: string;
    };
}

export interface ICreateEditWidgetReq {
    widgetId?: string;
    name: string;
    widgetType:
        | number
        | {
              value: string;
              name: string;
          };
    processType:
        | number
        | {
              value: string;
              name: string;
          };
    otpLength: number;
    processes: ICreateEditWidgetProcess[];
}

export interface ICreateEditWidgetProcess {
    processVia:
        | number
        | {
              value: string;
              name: string;
          };
    channel: {
        value: string;
        name: string;
    };
    retryVia: string;
    templateId: string;
    templateVariables:
        | {
              type: string;
              length: string;
          }
        | {
              id: string;
              brand_name: string;
          }
        | {
              process_type: string;
              length: string;
              status: string;
          }
        | {};
}

export interface ICreateEditWidgetRes extends IOTPWidget {
    processes: ICreateEditWidgetResProcess[];
}

export interface ICreateEditWidgetResProcess extends ICreateEditWidgetProcess {
    widgetType: number;
    processId: string;
}

export interface ISendOTPChannels {
    primaryChannels: { [key: string]: string };
    retryChannels: { [key: string]: string };
    mobileChannels: { [key: string]: string };
}
