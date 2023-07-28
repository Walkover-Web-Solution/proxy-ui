export interface IWhatsAppClientTemplatesRespModel {
    category: string;
    name: string;
    namespace: string;
    languages: ILanguagesModel[];
}

export interface ILanguagesModel {
    id: string;
    language: string;
    status: string;
    rejection_reason: string;
    code: IWhatsAppClientTemplatesJsonCodeRespModel[];
}

export interface IWhatsAppClientTemplatesJsonCodeRespModel {
    format?: string;
    text?: string;
    type?: string;
    buttons?: any[];
}

export interface IWhatsAppTemplateRequestBody {
    name: string;
    language: string;
    namespace: string;
    template_code: IWhatsAppClientTemplatesJsonCodeRespModel[];
    integrated_number: string;
}

export interface IWhatsAppTemplateJsonCodeResp {
    // integrated_number: string;
    // content_type: string;
    // payload: IPayloadObj;
    // authkey: string;
    endpoint: string;
    authkey: string;
    header: any;
    raw_data: any;
}

export interface ICreateEditWhatsAppTemplateRequestBody {
    integrated_number: string;
    template_name: string;
    language: string;
    category: string;
    components: IWhatsAppClientTemplatesJsonCodeRespModel[];
}

export interface IPayloadObj {
    to: string;
    type: string;
    template: ITemplateObj;
}

export interface ITemplateObj {
    name: string;
    language: ILanguageObj;
    namespace: string;
    components: IComponentObj[];
}

export interface ILanguageObj {
    code: string;
    policy: string;
}

export interface IComponentObj {
    type: string;
    parameters: IParameterObj[];
}

export interface IParameterObj {
    type: string;
    text: string;
}

export enum WhatsAppHeaderType {
    Text = 'TEXT',
    Media = 'MEDIA',
}
export enum WhatsAppHeaderMediaType {
    Document = 'DOCUMENT',
    Image = 'IMAGE',
    Video = 'VIDEO',
}

export enum WhatsAppButtonsType {
    QuickReply = 'QUICK_REPLY',
    CallToAction = 'CALL_TO_ACTION',
    MarketingOptOut = 'MARKET_OPT_OUT',
}
export enum WhatsAppButtonsCallToActionType {
    PhoneNumber = 'PHONE_NUMBER',
    Url = 'URL',
}

export enum WhatsAppTemplateCategory {
    Utility = 'UTILITY',
    Marketing = 'MARKETING',
    Authentication = 'AUTHENTICATION',
}
