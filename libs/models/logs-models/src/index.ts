export interface ILogsRes {
    id: number;
    status_code: number;
    user_ip: string;
    created_at: Date;
    updated_at: Date;
    slug: string;
    endpoint: string;
    project_name: string;
    environment_name: string;
    response_time_in_ms: string;
}

export interface ILogsReq {
    sortBy: string;
    order: string;
    slug: string;
    url_unique_id: string;
    range: string;
    from: string;
    to: string;
    user_ip: string;
    endpoint: string;
    startDate: string;
    endDate: string;
}

export interface IProjects {
    id: number;
    name: string;
    client_id: number;
    created_at: string;
    updated_at: string;
    created_by?: ICreatedOrUpdatedBy;
    updated_by?: ICreatedOrUpdatedBy;
    environments_with_slug: IEnvironments[];
}

export interface IEnvironments {
    id: number;
    name: string;
    client_id: number;
    created_at: string;
    updated_at: string;
    created_by?: ICreatedOrUpdatedBy;
    updated_by?: ICreatedOrUpdatedBy;
    projects?: IProjects;
    project_slug?: string;
}

export interface ICreatedOrUpdatedBy {
    id: number;
    name: string;
    email: string;
}

export interface ILogDetailRes {
    id: number;
    request_body: string | { [key: string]: any };
    headers: string | { [key: string]: any };
    response: string | { [key: string]: any };
}
