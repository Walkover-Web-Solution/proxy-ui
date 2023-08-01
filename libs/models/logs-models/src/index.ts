export interface ILogsData {
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
