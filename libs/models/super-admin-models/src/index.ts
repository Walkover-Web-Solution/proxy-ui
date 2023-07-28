export interface ISuperAdminsModel {
    data: IUsersModelRes;
    status: string;
    hasError: boolean;
    errors: any[];
}

export interface IUsersModelRes {
    data: IUsersModel[];
    itemsPerPage: number;
    pageNo: number;
    pageNumber: number;
    totalEntityCount: number;
    totalPageCount: number;
}

export interface IAddUser {
    id?: string;
    name: string;
    email: string;
    role_id: string;
    microservices?: Array<number>;
}

export interface IUsersModel {
    id: number;
    name: string;
    email: string;
    role_id: number;
    microservices: IMicroservice[];
    uid?: string;
}

export interface IMicroservice {
    id: number;
    service_name: string;
}

export interface IMicroserviceModel {
    id: number;
    service_name: string;
    group_names: Array<IGroupNames>;
}

export interface IGroupNames {
    microservice_id: number;
    group_name: string;
}
export interface IMicroserviceRes {
    data: IMicroservice[];
    status: string;
    hasError: boolean;
    errors: string[];
}

export interface IMicroservice {
    id: number;
    service_name: string;
    group_names: IGroupName[];
}

export interface IGroupName {
    microservice_id: number;
    group_name: string;
}

export interface ILogsResponse {
    data: {
        id: number;
        request_body: string;
        status_code: number;
        request_type: string;
        created_at: string;
        updated_at: string;
        microservice: string;
        endpoint: string;
        response_time_in_ms: string;
        user: IUser;
    };
}
export interface IUser {
    id: number;
    name: string;
    email: string;
}

export interface ILogsFilterRequest {
    pageNo: number;
    itemsPerPage: number;
    totalPageCount: number;
    user_email?: string;
    sortOrder?: string;
    sortBy?: string;
}

/** Permission Interfaces */

export interface IGetPermission {
    microservice_id: number;
    group_name: string;
}

export interface IPermission {
    created_at: string;
    group_name?: string;
    id: number;
    microservice_id?: number;
    permission_name: string;
    updated_at?: string;
}

export interface IAddPermissionRequest {
    group_name: string;
    microservice_id: number;
    permission_name: string;
}

export const SuperAdminRoles = {
    1: 'SuperAdmin',
    2: 'Admin',
    3: 'User',
};
