export interface IAddCustomAttributeReqModel {
    name?: string;
    field_type_id?: number;
    is_visible?: number;
    is_secured?: number;
    configurations?: any;
}

export interface IGetCustomAttributeResModel {
    id: string;
    is_custom_field: boolean;
    name: string;
    operators: IOperators[];
    short_name: string;
    type: ICustomAttributeFieldType;
    seq: number;
    is_unique: boolean;
    // extra given by palash
    phonebook_id: number;
    field_type_id: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    is_visible: number;
    is_secured?: number;
    configurations?: any;
    apiName?: string;
}

export interface IOperators {
    field_type_id?: number;
    mathematical_symbol: string;
    label: string;
}

export interface IUpdateUniqueFieldReq {
    is_unique: boolean;
    seq: number;
}

export interface ICustomAttributeFieldType {
    field_length?: string;
    icon_url?: string;
    id: string | number;
    name: string;
    configurations?: any;
}

export interface CustomAttributeResponseModel {
    message: string;
    field?: IGetCustomAttributeResModel;
}
