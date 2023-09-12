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

export interface IEnvProjects {
    id: number;
    project_name: string;
    environment_name: string;
    slug: string;
}

export interface ILogDetailRes {
    id: number;
    request_body: string | { [key: string]: any };
}
