import { Inject, Injectable } from '@angular/core';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { ProxyBaseUrls } from '@proxy/models/root-models';
import { Observable } from 'rxjs';
import { AnalyticsUrls } from '@proxy/urls/analytics-urls';

type Interval = 'hour' | 'day' | 'week';

export interface IAnalyticsParams {
    feature_configuration_id?: number;
    range?: 'day' | 'week' | 'month';
    start?: string;
    end?: string;
}

export interface ITimeseriesParams extends IAnalyticsParams {
    metric: 'signups' | 'logins' | 'active_users';
    interval: Interval;
}

export interface IBreakdownParams extends IAnalyticsParams {
    group_by: 'service_id' | 'source' | 'type';
    interval?: Interval;
}

@Injectable({
    providedIn: 'root',
})
export class AnalyticsService {
    constructor(
        private http: HttpWrapperService,
        @Inject(ProxyBaseUrls.BaseURL) private baseURL: string
    ) {}

    public getOverview(params: IAnalyticsParams): Observable<any> {
        return this.http.get(AnalyticsUrls.overview(this.baseURL), params);
    }

    public getTimeseries(params: ITimeseriesParams): Observable<any> {
        return this.http.get(AnalyticsUrls.timeseries(this.baseURL), params);
    }

    public getBreakdown(params: IBreakdownParams): Observable<any> {
        return this.http.get(AnalyticsUrls.breakdown(this.baseURL), params);
    }
}
