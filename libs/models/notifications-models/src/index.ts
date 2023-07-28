export interface INotificationCreateReq {
    template_name: string;
    content: string;
    variables?: any;
}

export interface INotificationUpdateReq extends INotificationCreateReq {
    status: 'active' | 'inactive';
    version: string;
}

export interface ISendNotificationReq {
    template_name: string;
    channels: string[];
    variables: { [key: string]: string };
}

export interface INotificationTemplateRes {
    template_data: INotificationTemplateData[];
    template_version_data: INotificationTemplateVersionData[];
    total_template_count: number;
}

export interface INotificationTemplateVersionData {
    template_id: number;
    status: 'active' | 'inactive';
    version: string;
    content: string;
    horizontal_position?: 'center' | 'left' | 'right';
    vertical_position?: 'center' | 'top' | 'bottom';
}

export interface INotificationTemplateData {
    template_id: number;
    name: string;
    active_version: number;
    active_version_content: string;
    versionsData?: INotificationTemplateVersionData[];
    active_version_variables?: string[];
    horizontal_position?: 'center' | 'left' | 'right';
    vertical_position?: 'center' | 'top' | 'bottom';
}
