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
    search: string;
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
    format: { [key: string]: any };
    encode_type: string;
    key: string;
}

export interface IMethodService {
    name: string;
    method_id: number;
    service_id: number;
    configurations: { fields: { [key: string]: IFieldConfig }; mappings: any[] };
    requirements: { [key: string]: IFieldConfig };
}

export interface IFieldConfig {
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
    delimiter?: string;
    read_only_value?: string[];
}

export enum FeatureFieldType {
    Text = 'text',
    ChipList = 'chipList',
}
