import { ICreatedOrUpdatedBy } from '@proxy/models/logs-models';

export enum ForwardToEnum {
    same_as_endpoint = 1,
    viasocket = 2,
    perform_operation = 3,
}

export interface IEnvProject {
    id: number;
    project_id: number;
    project_name: string;
    environment_name: string;
    slug: string;
}
export interface IEndpointsRes {
    id: number;
    endpoint: string;
    rate_limiter: number;
    is_active: boolean;
    request_type: string;
    created_at: string;
    updated_at: string;
    position: string;
    use_config_from: string;
    created_by?: ICreatedOrUpdatedBy;
    updated_by?: ICreatedOrUpdatedBy;
}
