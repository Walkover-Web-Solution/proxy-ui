export interface IShortURLPaginatedResponse<P> {
    current_page: string;
    last_page: number;
    total: number;
    items: P;
    total_clicks?: number;
}

export interface IURLRequest {
    userId: string;
    page: number;
    limit: number;
}

export interface IURLLogRequest {
    userId: string;
    page: number;
    limit: number;
    shortUrl: string;
    longUrl: string;
    clickCount: string;
    clickCountCon: string;
    startDate: string;
    endDate: string;
}

export interface IURLCreateRequest {
    userId: string;
    link: string;
    domain: number;
    phone: string;
    request_id: number;
    flag: number;
    email: string;
    expiry: string;
}

export interface ILinkItem {
    shortId: string;
    createdAt: string;
    expiry: number;
    shortUrl: string;
    longUrl: string;
    expiryAt: string;
    updatedAt: string;
}

export interface ILinkLog {
    shortId: string;
    shortUrl: string;
    longUrl: string;
    clickCount: number;
    requestId: string;
    date: string;
    campaign_name?: string;
    phone?: string;
}

export interface IItemClick {
    ip: string;
    browser: string;
    OS: string;
    country: string;
    date: string;
}
