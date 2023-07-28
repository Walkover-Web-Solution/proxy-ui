export * from './generateRandomPass';
export * from './mange-group';
export * from './payment-method';
export * from './request';
export * from './security';
export * from './sender-id';
export * from './settings-token';
export * from './unsubscribe';
export * from './user-setting';

export interface IActiveSession {
    id: number;
    ipAddress: string;
    browser: string;
    isThisSession: boolean;
    country_name: string;
    date: string;
}

/* eslint-disable @typescript-eslint/interface-name-prefix */
export interface IPermissionGroup {
    name: string;
    permissions: IPermission[];
}

export interface IPermission {
    groupPermission: boolean;
    name: string;

    [key: string]: boolean | string;
}

export interface IGroup {
    id: number;
    groupName: string;
    restrictedIP: string;
    permissionGroups: IPermissionGroup[];
}

export interface IGroupPermission {
    name: string;
    allowed: boolean;
}

export interface IAddMemberToGroup {
    groupId: number;
    memberId: number;
}

export interface IGroupMember {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

/* eslint-disable @typescript-eslint/interface-name-prefix */
export interface ICompanySetting {
    id: number;
    companyName: string;
    industry: string;
    country: string;
    state: string;
    zipcode: string;
    city: string;
    address: string;
    gstNo: string;
    timeZoneName: string;
    timezone: string;
    currency: string;
    accessToken: string | number;
    adminPanelLink: string | boolean;
    isWalletUser: boolean;
    isSubaccountUser: boolean;
    cityId: string;
    countryId: string;
    stateId: string;
    excelPluginPath: string;
    whitelabledExcelPluginPath: string;
    customCity?: string;
    signupDate: string;
    signUpOnlyDate?: string;
    accountManagerDetails?: IAccountManagerDetails;
    redirectToIdentityVerification?: 0 | 1;
    firstPurchase?: {
        value: 0 | 1;
        maximumAmountForComplimentaryOffer: number;
        discount: number;
    };
}

export interface IUserInfo {
    userName: string;
    password: string;
}

export interface IAccountManagerDetails {
    email: string;
    mobile: string;
    name: string;
    isAccountManager: boolean;
}
