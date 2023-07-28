export interface AdminLoginRequestResModel {
    id: string;
    adminName: string;
    adminEmail: string;
    status: AdminLoginRequestStatus;
    accessTime: string;
    accessTimeFormat: string;
    expiresAt: string;
    actionUser: string;
    lastUpdatedAt: string;
}

export interface AdminLoginRequestStatus {
    value: string;
    name: string;
}

export interface ApproveAdminLoginReqModel {
    id: string;
    accessTime: string;
    accessTimeFormat: string;
}

export interface DeclinedAminLoginReqModel {
    id: string;
}
