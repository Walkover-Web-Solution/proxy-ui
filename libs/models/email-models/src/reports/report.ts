import { Reports } from '../domains/domain';

export interface IExtraParam {
    domain_id: number;
    from_date_time: string;
    to_date_time: string;
    mail_type_id?: number | string;
}

export interface IDayWiseData {
    [key: string]: Reports;
}
