export interface ISettingTokenStatus {
    value: string;
    name: string;
}

export interface ISettingTokenAllTokenResModel {
    id: string;
    token_id: string;
    token: string;
    name: string;
    status: ISettingTokenStatus;
    lastUpdatedBy: string;
    lastUpdatedAt: string;
    createdBy: string;
    updatedBy: string;
}
