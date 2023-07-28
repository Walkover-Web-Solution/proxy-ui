import { BaseEmailFilterRequest } from '@msg91/models/root-models';

export interface IAddTemplateReqModel {
    name: string;
    subject: string;
    body: string;
    variables?: string[];
    files?: string[];
    meta?: any;
}

export interface isActive {
    is_active: boolean;
}

export interface IAddTemplateResModel {
    id: number;
    user_id: number;
    name: string;
    subject: string;
    body: string;
    created_at: string;
    updated_at: string;
    slug: string;
    status_id?: number;
    html?: string;
    css?: string;
    editor_id?: number; // 1 - froala , 2 - stripo
}

export interface IGetAllTemplateResModel extends IAddTemplateResModel {
    variables: string[];
    files: string[];
    meta?: any;
    versions: updateTemplateVersionResModel[];
    activeVersion?: updateTemplateVersionResModel;
}

export interface ITemplateThemeResModel {
    id: number;
    title: string;
    body: string;
    meta?: any;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    image: string;
}

export interface IStripoTemplateThemeModel {
    id: number;
    name: string;
    tags: string[];
    files: {
        html: string;
        css: string;
        png: string;
        url: string;
    };
}

export interface IStripoSelectedTemplate {
    id: number;
    row_html: string;
    row_css: string;
}

export interface ITemplateReqModel extends BaseEmailFilterRequest {
    with: string;
    status_id?: string | number;
}

export interface IBlockKeywordsResModel {
    id: number;
    word: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface updateTemplateVersionResModel {
    id: number;
    template_id: number;
    name: string;
    subject: string;
    body: string;
    variables: null | string[];
    files?: null | string[];
    meta?: any;
    status_id: 1;
    is_active: boolean;
    description: null;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    reason_id: null | number;
    reason: null | IEmailTemplateReasonResponseModel;
}

export interface IAddTemplateVersionReqModel {
    name: string;
    subject: string;
    body: string;
    variables?: string[];
    files?: string[];
    meta?: any;
}

export interface IDuplicateTemplate {
    subject: string;
    body: string;
}

export interface IEmailTemplateReasonResponseModel {
    id: number;
    title: string;
    content: string;
    reason_type: number;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
}

export interface IStripoToken {
    token: string;
}

export interface IEmailKeywordModel {
    _id: string;
    keyword: string;
    check_in: string;
    stage: string;
    weightage: number;
    mail_type_id: number;
    updated_at: string;
    created_at: string;
}

export interface IEmailKeywordReq {
    keyword: string;
    check_in: string;
    stage: string;
    weightage: number;
    mail_type_id: number;
}

export interface IEmailKeywordReqPayload {
    words: IEmailKeywordReq[];
}

export interface IEmailKeywordUpdateReqPayload {
    weightage: number;
    mail_type_id: number;
}

export enum IEmailMailTypesIDs {
    Transactional = 1,
    Notificational = 2,
    Promotional = 3,
    OTP = 4,
    Abuse = 5,
}

export const EMAIL_MAIL_TYPES = {
    1: 'Transactional',
    2: 'Notificational',
    3: 'Promotional',
    4: 'OTP',
    5: 'Abuse',
};
