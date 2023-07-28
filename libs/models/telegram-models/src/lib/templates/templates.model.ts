export interface ITelegramTemplateRequest {
    bot_id: number;
    bot_username: string;
    template_name: string;
    contents: any;
}

export interface ITelegramTemplateResponse {
    template_data: ITelegramTemplate[];
    total_template_count: number;
}

export interface ITelegramTemplateVersion {
    content: any;
    id: number;
    is_active: boolean;
    status: string;
    version: string;
    message_type: string;
}

export interface ITelegramTemplateStruct {
    bot_details: IBotDetails[];
    inbound_setting: string[];
    template_contents: any;
}

export interface IBotDetails {
    bot_id: number;
    bot_name: string;
    bot_username: string;
}

export interface ITelegramTemplate {
    bot_id: number;
    bot_name: string;
    content: any;
    message_type: string;
    active_version: string;
    bot_username: string;
    template_name: string;
    versions: ITelegramTemplateVersion[];
}
