export interface IAllSegmentByPhoneBookIdResModel {
    id: number;
    name: string;
    sName: string;
    email: string;
    prof: string;
    dob: string;
}

export interface IAllSegmentsResModel {
    // id: string;
    // pb_id: string;
    // name: string;
    // created_at: string;
    // query: any;
    // dates: any[];
    // records: string;
    // segment_id: string;
    // fields?: any;
    // is_old_group?: any;
    // filters: any[];

    // new response by palash
    id: number;
    phonebook_id: number;
    name: string;
    query: any;
    filters?: any;
    records_count: number;
    counting_in_progress: number;
    deleted_at: string;
    permanently_deleted_on: string;
    created_at: string;
    updated_at: string;
}

export interface IGetSegmentDataResp {
    id: string;
    pb_id: string;
    name: string;
    created_at: string;
    query?: any;
    dates?: any;
    records: string;
    segment_id: string;
    fields?: any;
    is_old_group?: any;
    filter_query: Filterquery;
}

interface Filterquery {
    rules: Rule2[];
    condition: string;
}

interface Rule2 {
    rules: Rule[];
    condition: string;
}

interface Rule {
    type: string;
    field: string;
    value: string;
    operator: string;
    isValid: boolean;
}

// for communication apis

export interface ICommunicationTypeResModel {
    id: number;
    name: string;
    configurations: IConfigurations;
}

export interface IConfigurations {
    setup: ISetup;
    mappings: {
        type: string;
        source: any;
        fields: IMapping[];
    };
    variables: {
        type: string;
        fields: any;
        source: any;
    };
    maxEmailIdsPerRequest: number;
}

export interface IMapping {
    name: string;
    type: string;
    label: string;
    is_required: boolean;
    validations: string[];
}

export interface ISetup {
    fields: IField[];
}

export interface IField {
    name: string;
    type: string;
    label: string;
    source?: ISource;
    is_required: boolean;
    options?: IFieldOptions[];
    value?: any;
    rules?: any;
}

export interface ISource {
    field: string;
    label: string;
    endpoint: string;
}

export interface ICommunicationStatuesType {
    id: number;
    name: string;
}

export interface IFieldOptions {
    key: number;
    value: string;
}
