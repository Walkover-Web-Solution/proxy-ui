export class BaseResponse<T, TRequest> {
    public data: T;
    public status: 'success' | 'fail';
    public hasError: boolean;
    public errors: string[] | string | { [key: string]: [] };
    public request?: TRequest;
    public queryString?: any;
}

export interface IPaginatedResponse<P> {
    data: P;
    itemsPerPage: number;
    pageNumber: number;
    pageNo?: number;
    totalEntityCount: number;
    totalEntityCountWithoutFilter?: number;
    totalPageCount: number; // Total records of p in database without applying filters
}

export interface IReqParams {
    [key: string]: string | number | boolean;
}

export interface IIdNameModel {
    id: number;
    name: string;
}

export enum ProxyBaseUrls {
    BaseURL = 'BASE_URL',
    FirebaseConfig = 'FIREBASE_CONFIG',
    Env = 'ENV',
    IToken = 'IToken',
    ProxyLogsUrl = 'PROXY_LOGS_URL',
    ClientURL = 'CLIENT_BASE_URL',
}

export interface IToken {
    proxyJWTToken: string;
    token: string;
    companyId: string;
}

export interface ILineGraphData {
    name: string;
    series: ILineGraphSeries[];
}

export interface ILineGraphSeries {
    value: number;
    name: number | Date;
}

export interface keyValuePair<T> {
    [key: string]: T;
}

export class MicroserviceBaseResponse<T, TRequest> extends BaseResponse<T, TRequest> {
    success: boolean;
    message: string[] | string | { [key: string]: [] };
}

export type MappedTypeWithOptional<Type> = {
    [Properties in keyof Type]?: Type[Properties];
};

export interface IFirebaseUserModel {
    uid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoURL: string;
    emailVerified: boolean;
    jwtToken: string;
}

export function errorResolver(params: string[] | string | { [key: string]: [] }): string[] {
    if (typeof params === 'string') {
        return [params];
    } else if (params instanceof Array) {
        return params;
    } else if (params instanceof Object) {
        return [].concat(
            ...Object.keys(params).map((p) => {
                return params[p];
            })
        );
    } else {
        return ['Something went wrong.'];
    }
}

export interface ILoginResponse {
    message: string;
    auth: string;
}

export interface IClientSettings {
    client: IClient;
}

export interface IClient {
    id: number;
    name: string;
    mobile: string;
    email: string;
    url_unique_id: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    stage: string;
    settings: { [key: string]: any };
}
