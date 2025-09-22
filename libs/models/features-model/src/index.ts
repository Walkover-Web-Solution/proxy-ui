export interface IFeature {
    id: number;
    feature_id: number;
    method_id?: number;
    name: string;
    reference_id: string;
    feature: { id: number; name: string };
    method: { id: number; name: string };
    session_time: number;
    created_by: ICreatedBy;
    updated_by: IUpdatedBy;
}

export interface IFeatureDetails extends IFeature {
    projects?: string[];
    callback_url: string;
    authorization_format: IAuthorizationFormat;
    service_configurations: IServiceConfigurations[];
}

export interface IServiceConfigurations {
    service_id: number;
    is_enable?: boolean;
    feature_configuration_id: number;
    configurations: { fields: { [key: string]: any }; mappings: any[] };
    requirements: { [key: string]: any };
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
    is_enable?: boolean;
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
    is_disable?: boolean;
    value_type: string;
    is_required: boolean;
    sourceFieldLabel: string;
    sourceFieldValue: string;
    delimiter?: string;
    read_only_value?: string[];
    allowed_types: string;
    fileName: string;
}

export enum FeatureFieldType {
    Text = 'text',
    ChipList = 'chipList',
    ReadFile = 'readFile',
    Select = 'select',
    TextArea = 'textarea',
}

export const ProxyAuthScript = (
    baseUrl: string,
    referenceId = '<reference_id>',
    type = '<type>',
    time?: number
) => `<script type="text/javascript">
    var configuration = {
        referenceId: '${referenceId}',
        type: '${type}',
        success: (data) => {
            // get verified token in response
            console.log('success response', data);
        },
        failure: (error) => {
            // handle error
            console.log('failure reason', error);
        },
    };
</script>
<script
    type="text/javascript"
    onload="initVerification(configuration)"
    src="${ProxyAuthScriptUrl(baseUrl, time)}"
></script>`;

export const ProxyAuthScriptUrl = (baseUrl: string, time?: number) =>
    `${baseUrl}/assets/proxy-auth/proxy-auth.js${time ? '?time=' + time : ''}`;

export enum FeatureServiceIds {
    Msg91OtpService = 6,
    GoogleAuthentication = 7,
    PasswordAuthentication = 9,
}
