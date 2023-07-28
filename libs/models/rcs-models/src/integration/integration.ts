//#region POST:RegistrationData
import { IRcsStatus } from '@msg91/models/setting-models';

export interface RegistrationData {
    company_id: number;
    display_name: string;
    short_description: string;
    color: string;
    small_logo_name: string;
    small_logo_format: string;
    banner_image_name: string;
    banner_image_format: string;
    agent_region: string;
    primary_phone_number: string;
    primary_phone_label: string;
    secondary_phone: string;
    secondary_phone_label: string;
    primary_website: string;
    primary_website_label: string;
    secondary_website: string;
    secondary_website_label: string;
    primary_email: string;
    primary_email_label: string;
    secondary_email: string;
    secondary_email_label: string;
    privacy_policy_url: string;
    terms_of_service_url: string;
    status: IRcsStatus;
    rcs_use: string;
}

export interface LaunchData {
    email_address: string;
    where_to_launch: string[];
    contact_names: string[];
    contact_titles: string[];
    contact_mails: string[];
    contact_phones: string[];
    trigger_action: string;
    interactions: string;
    opt_out_message: string;
    parent_company_name: string;
    parent_company_url: string;
    spike_time: string;
    number_of_users: number;
    message_count_per_month: number;
    start_date_to_send_message: string;
    agent_access_instruction: string;
    video_urls: string[];
    screenshot_urls: any[];
    status: IRcsStatus;
    opt_in_description: string;
}

export interface IRegistrationRespModel {
    registration_data: RegistrationData;
    launch_data: LaunchData;
    id: number;
}

export interface IRCSList {
    display_name: string;
    id: number;
    primary_email_id: string;
    primary_phone_number: string;
    project_id: string;
    rcs_use: string;
    status: string;
}

//#endregion

//#region Delete:: rcs integration/manager
export interface IDeleteManagerRespModel {
    message: string;
}

//#endregion

//#region POST :: /rcs integration/
export interface IIntegrationReqModel {
    display_name: string;
    short_description: string;
    color: string;
    small_logo_name: string;
    small_logo_format: string;
    banner_image_name: string;
    banner_image_format: string;
    banner_image: string;
    agent_region: string;
    primary_phone_number: string;
    primary_phone_label: string;
    primary_email: string;
    primary_email_label: string;
    privacy_policy_url: string;
    terms_of_service_url: string;
    where_to_launch: [];
    trigger_action: string;
    interactions: string;
    opt_out_message: string;
    opt_in_description: string;
    parent_company_name: string;
    // spike_time: string;
    secondary_phone: string;
    secondary_phone_label: string;
    primary_website: string;
    primary_website_label: string;
    secondary_website: string;
    secondary_website_label: string;
    secondary_email: string;
    secondary_email_label: string;
    contact_names: [];
    contact_titles: [];
    contact_mails: [];
    contact_phones: [];
    parent_company_url: string;
    agent_access_instruction: string;
    video_urls: [];
    screenshot_urls: [];
    // rcs_use: string;
}

export interface IIntegrationFormModel {
    display_name: string;
    short_description: string;
    color: string;
    small_logo_name?: string;
    small_logo_format: string;
    banner_image_name?: string;
    banner_image_format: string;
    banner_image?: string;
    agent_region: string;
    primary_phone_number: string;
    primary_phone_label: string;
    primary_email: string;
    primary_email_label: string;
    privacy_policy_url: string;
    terms_of_service_url: string;
    trigger_action: string;
    interactions: string;
    opt_out_message: string;
    opt_in_description: string;
    parent_company_name: string;
    secondary_phone: string;
    secondary_phone_label: string;
    primary_website: string;
    primary_website_label: string;
    secondary_website: string;
    secondary_website_label: string;
    secondary_email: string;
    secondary_email_label: string;
    contact_names: string;
    contact_titles: string;
    contact_mails: string;
    contact_phones: string;
    parent_company_url: string;
    agent_access_instruction: string;
    video_urls: string;
    screenshot_urls: string;
    // rcs_use: string;
}

//#endregion

//#region DELETE :: /rcs integration/user/216634/
export interface IDeleteIntegrationUserRespModel {
    message: string;
}

//#endregion

//#region PUT :: /rcs integration/216634/
export interface IIntegrationReqModel {
    status: string;
}

export interface IIntegrationRespModel {
    message: string;
    status: string;
}

//#endregion

export interface IRCSRegistrationDropdown {
    rcs_use: string[];
    region: string[];
    where_to_launch: string[];
}

export interface IRCSLogsDropdown {
    direction: string[];
    failure_reason: string[];
    status: string[];
    client_list: string[];
}

export interface IRCSTemplateDropDown {
    project_id: string[];
    function_name: { [key: string]: string[] };
    template_name: string[];
}

export interface IRCSTemplate {
    id: number;
    project_id: string;
    name: string;
    namespace: string;
    status: string;
    function_name: string;
    message_body: {
        [key: string]: string;
    };
    payload: {
        customer_number: string;
        project_id: string;
        function_name: string;
        name: string;
        namespace: string;
        variables: string[];
    };
    content: any;
}

export interface IRCSTemplateCreateReq {
    project_id: string;
    name: string;
    function_name: string;
    message_body: {
        [key: string]: string;
    };
}
