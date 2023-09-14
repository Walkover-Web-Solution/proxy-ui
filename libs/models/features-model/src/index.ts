export interface IFeature {
    id: number;
    feature_id: number;
    name: string;
    reference_id: string;
    feature: { id: number; name: string };
    method: { id: number; name: string };
    created_by: ICreatedBy;
    updated_by: IUpdatedBy;
}

export interface IFeatureReq {
    startDate: string;
    endDate: string;
    slug: string;
}

export interface ICreatedBy {
    id: number;
    name: string;
    email: string;
}

export interface IUpdatedBy {
    id: number;
    name: string;
    email: string;
}

export interface IFeatureType {
    id: number;
    name: string;
    icon: string;
}

export interface IMethod {
    id: number;
    name: string;
    service_use: string;
    icon: string;
    authorization_format: IAuthorizationFormat;
    method_services: IMethodService[];
}

export interface IAuthorizationFormat {
    format: IFormat;
    encode_type: string;
    key: string;
}

export interface IFormat {
    company: ICompany;
    user: User;
    ip: string;
}

export interface ICompany {
    id: string;
    name: string;
    email: string;
    mobile: string;
    timezone: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    mobile: string;
}

export interface IMethodService {
    name: string;
    method_id: number;
    service_id: number;
    configurations: IConfigurations;
    requirements: IRequirements;
}

export interface IConfigurations {
    fields: IFields;
    mappings: any[];
}

export interface IFields {
    scope: IScope;
    redirect_uri: IRedirectUri;
}

export interface IScope {
    type: string;
    label: string;
    regex: string;
    value: string;
    source: string;
    is_hidden: boolean;
    value_type: string;
    is_required: boolean;
    read_only_value: string[];
    sourceFieldLabel: string;
    sourceFieldValue: string;
}

export interface IRedirectUri {
    type: string;
    label: string;
    regex: string;
    value: string;
    source: string;
    is_hidden: boolean;
    value_type: string;
    is_required: boolean;
    sourceFieldLabel: string;
    sourceFieldValue: string;
}

export interface IRequirements {
    client_id: IClientId;
    client_secret: IClientSecret;
}

export interface IClientId {
    type: string;
    label: string;
    regex: string;
    value: string;
    source: string;
    is_hidden: boolean;
    value_type: string;
    is_required: boolean;
    sourceFieldLabel: string;
    sourceFieldValue: string;
}

export interface IClientSecret {
    type: string;
    label: string;
    regex: string;
    value: string;
    source: string;
    is_hidden: boolean;
    value_type: string;
    is_required: boolean;
    sourceFieldLabel: string;
    sourceFieldValue: string;
}
