import { IEmailUser } from '../domain/domain';

export interface IEmailTemplateReqModel {
    with?: string;
    page: number;
    per_page: number;
}

export interface IGetAllTemplatesResModel {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    subject: string;
    body: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    variables: string[];
    files: string[];
    meta: string;
    status_id: number;
    description: null;
    user: IEmailUser;
    reason_id: null | number;
    reason: IAllRejectReasonResModel;
    mail_type_id?: number;
}

export interface IGetTemplateDetail {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    subject: string;
    body: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    variables: string[];
    files: string[];
    meta: string;
    status_id: number;
    description: null;
    user: IEmailUser;
}

export interface IUpdateTemplateReqModel {
    method: string;
    url: string;
    event: string;
}

export interface IUpdateTemplateResModel {
    [key: string]: string;
}

export interface IAllRejectReasonResModel {
    id: number;
    title: string;
    content: string;
    reason_type: number;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
}

export interface IUpdateTemplateStatusReqModel {
    status_id: number;
    reason_id: number;
}
