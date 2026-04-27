import { INFO_TOOLTIPS } from '@proxy/constant';

export type Interval = 'hour' | 'day' | 'week';

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
    group_by: 'service_id' | 'source' | 'type' | 'country';
    interval?: Interval;
}

export enum DateRange {
    day = 'day',
    week = 'week',
    month = 'month',
}

export interface IRangeOption {
    label: string;
    value: DateRange;
}

export interface IOverviewCard {
    key: string;
    valueKey: string;
    valueKeyFallback?: string;
    label: string;
    icon: string;
    sub: string;
    infoTooltip: string;
}

export enum TimeseriesMetric {
    logins = 'logins',
    signups = 'signups',
    active_users = 'active_users',
}

export enum TimeseriesInterval {
    hour = 'hour',
    day = 'day',
    week = 'week',
}

export interface IIntervalOption {
    label: string;
    value: TimeseriesInterval;
}

export interface ITimeseriesMetricConfig {
    label: string;
    value: TimeseriesMetric;
    color: string;
    infoTooltip: string;
}

export interface ITimeseriesSeries {
    label: string;
    color: string;
    infoTooltip: string;
    data: { period: string; value: number }[];
}

export enum BreakdownGroupBy {
    service_id = 'service_id',
    source = 'source',
    type = 'type',
    country = 'country',
}

export interface IBreakdownGroupByOption {
    label: string;
    value: BreakdownGroupBy;
}

export const OVERVIEW_CARDS: IOverviewCard[] = [
    {
        key: 'users',
        valueKey: 'users.feature_configuration_total',
        valueKeyFallback: 'users.client_total',
        label: 'Total Users',
        icon: 'people',
        sub: 'registered total',
        infoTooltip: INFO_TOOLTIPS.dashboard.overviewCards.users,
    },
    {
        key: 'signups',
        valueKey: 'signups.total',
        label: 'Signups',
        icon: 'person_add',
        sub: 'in selected period',
        infoTooltip: INFO_TOOLTIPS.dashboard.overviewCards.signups,
    },
    {
        key: 'logins',
        valueKey: 'logins.total',
        label: 'Logins',
        icon: 'login',
        sub: 'in selected period',
        infoTooltip: INFO_TOOLTIPS.dashboard.overviewCards.logins,
    },
    {
        key: 'active_users',
        valueKey: 'active_users.unique',
        label: 'Active Users',
        icon: 'group',
        sub: 'unique in period',
        infoTooltip: INFO_TOOLTIPS.dashboard.overviewCards.active_users,
    },
];

export const RANGE_OPTIONS: IRangeOption[] = [
    { label: 'Today', value: DateRange.day },
    { label: 'This Week', value: DateRange.week },
    { label: 'This Month', value: DateRange.month },
];

export const TIMESERIES_METRICS: Record<TimeseriesMetric, ITimeseriesMetricConfig> = {
    [TimeseriesMetric.signups]: {
        label: 'Signups',
        value: TimeseriesMetric.signups,
        color: '#10b981',
        infoTooltip: INFO_TOOLTIPS.dashboard.charts.signups,
    },
    [TimeseriesMetric.logins]: {
        label: 'Logins',
        value: TimeseriesMetric.logins,
        color: '#6366f1',
        infoTooltip: INFO_TOOLTIPS.dashboard.charts.logins,
    },
    [TimeseriesMetric.active_users]: {
        label: 'Active Users',
        value: TimeseriesMetric.active_users,
        color: '#f59e0b',
        infoTooltip: INFO_TOOLTIPS.dashboard.charts.active_users,
    },
};

export const INTERVAL_OPTIONS: Record<TimeseriesInterval, IIntervalOption> = {
    [TimeseriesInterval.hour]: { label: 'Hourly', value: TimeseriesInterval.hour },
    [TimeseriesInterval.day]: { label: 'Daily', value: TimeseriesInterval.day },
    [TimeseriesInterval.week]: { label: 'Weekly', value: TimeseriesInterval.week },
};

export const GROUP_BY_OPTIONS: IBreakdownGroupByOption[] = [
    { label: 'By Type', value: BreakdownGroupBy.type },
    // { label: 'By Source', value: BreakdownGroupBy.source },
    { label: 'By Service', value: BreakdownGroupBy.service_id },
    { label: 'By Country', value: BreakdownGroupBy.country },
];

export function intervalForRange(range: string): TimeseriesInterval {
    if (range === DateRange.day) return TimeseriesInterval.hour;
    if (range === DateRange.month) return TimeseriesInterval.week;
    return TimeseriesInterval.day;
}
