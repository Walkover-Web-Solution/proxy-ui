import { IPaginationAnalyticsResponse } from '@msg91/models/root-models';

export interface IAdminAnalyticsAllUsersProfitModel {
    date: string;
    currency: string;
    credit: number;
    cost: number;
    profit: number;
}
export interface IAdminAnalyticsUserProfitModel {
    date: string;
    company: string;
    credit: number;
    cost: number;
    profit: number;
}
export interface IAdminAnalyticsVendorsProfitModel {
    date: string;
    vendor: string;
    currency: string;
    credit: number;
    cost: number;
    profit: number;
}

export interface IAdminAnalyticsUsersModel {
    sent: number;
    date: string;
    company: string;
    balance_deducted: number;
    delivered: number;
    failed: number;
    ndnc: number;
    blocked: number;
    auto_failed: number;
    rejected: number;
    delivery_time: number;
    balanceDeducted: number;
    deliveredCredit: number;
    failedCredit: number;
    rejectedCredit: number;
}
export interface IAdminAnalyticsVendorsModel {
    date: string;
    smsc: string;
    total: number;
    balance_deducted: number;
    delivered: number;
    failed: number;
    sent: number;
    ndnc: number;
    blocked: number;
    auto_failed: number;
    rejected: number;
    delivery_time: number;
}

export interface AdminAnalyticParams {
    startDate: null | string;
    endDate: null | string;
    page?: number;
    pageSize?: number;
}

export interface AdminRequestExportReportsResponse {
    status: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
    resourceType: string;
    companyId: string;
    startDate: string;
    endDate: string;
    query: AdminRequestExportQuery;
    id: string;
    isExpired: boolean;
}

export interface AdminRequestExportQuery {
    companyId: string;
    startDate: string;
    endDate: string;
    timezone: string;
}

export interface AdminDownloadedDataResponse extends AdminRequestExportReportsResponse {
    file: string;
}

export type AdminAnalyticDownloadedDataResponse = {
    data: AdminDownloadedDataResponse[];
    pagination: IPaginationAnalyticsResponse;
};
