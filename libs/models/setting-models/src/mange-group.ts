import { IGroupPermission } from '.';
import { BaseFilterRequest } from '@msg91/models/root-models';

export interface IGetAllMemberReqModel extends BaseFilterRequest {
    userStatus: 'enable' | 'disabled' | 'all';
}

export interface IGetAllMembersRespModel {
    id: number;
    name: string;
    email: string;
    type: string;
    access: string;
    mobile: string;
    is_user_enabled: '1' | '0';
    is_email_verified: '1' | '0';
    isUserEnableDisableInProgress?: boolean;
    isUserResendInviteInProgress?: boolean;
}

export interface IAddMember {
    id: number;
    name: string;
    email: string;
    roleId: number;
    groupId: number;
}

export interface IGetMembersByGroupIdReqModel extends BaseFilterRequest {
    groupId: number;
}

export interface IGetMembersByGroupIdRespModel {
    id: number;
    name: string;
    email: string;
}

export interface IGroupMemberListItem {
    groupId: number;
    groupName: string;
}

export interface IMember {
    id: string;
    name: string;
    email: string;
    user_name: string;
    mobileNo: string;
    groupId: number | null;
    roleId: number | null;
    signupOn: string;
    lastLogin: string;
}

export interface IRemoveAgentModel {
    id: string;
    reassign_article_author: string;
    reassign_client: IReassignClient;
}

export interface IReassignClient {
    type: string;
    id: string;
}

export interface IUpdateMemberPermissions {
    memberId: number;
    permissions: IGroupPermission[];
}

export interface IReassignArticleAuthers {
    id: string;
    name: string;
    email: string;
}

export interface IGroupedReassignClients {
    type: string;
    clients: IIdName[];
}

export interface IIdName {
    id: string;
    name: string;
}

export interface IReassignClients {
    agents: IAgent[];
    teams: IIdName[];
}

export interface IAgent extends IIdName {
    email: string;
}

export interface IServerMessage {
    msg: string;
    msg_type: 'error' | 'success';
}

export type IEnableDisableMember = IServerMessage;

export type IResendInvite = IServerMessage;

export interface IUpdateRolReqModel {
    id: string;
    role: number;
}

export interface IUserRulePermission {
    ruleId: number;
    ruleName: string;
    microservices: IUserRulePermissionMicroservice[];
}

export interface IUserRulePermissionMicroservice {
    microserviceId: number;
    microserviceName: string;
    permission: IUserRulePermissionMicroservicePermission[];
}

export interface IUserRulePermissionMicroservicePermission {
    permissionId: string;
    permissionName: string;
    permissionDisplayName: string;
    value: string;
}

export enum PermissionsEnums {
    HELLO = '7',
    WHATSAPP = '4',
    RCS = '5',
    VOICE = '3',
    SMS = '1',
    CAMPAIGN = '6',
    EMAIL = '2',
    SEGMENTO = '8',
    SMS_SENDSMS_NOALLOWED = '1-send_sms-0',
    SMS_SENDSMS_VIEW = '1-send_sms-1',
    SMS_SENDSMS_EXPORT = '1-send_sms-2',
    SMS_PHONEBOOK_NOALLOWED = '1-phonebook-0',
    SMS_PHONEBOOK_VIEW = '1-phonebook-1',
    SMS_PHONEBOOK_EXPORT = '1-phonebook-2',
    SMS_FLOW_NOALLOWED = '1-flow-0',
    SMS_FLOW_VIEW = '1-flow-1',
    SMS_FLOW_EXPORT = '1-flow-2',
    SMS_API_NOALLOWED = '1-api-0',
    SMS_API_VIEW = '1-api-1',
    SMS_API_EXPORT = '1-api-2',
    SMS_OTP_NOALLOWED = '1-otp-0',
    SMS_OTP_VIEW = '1-otp-1',
    SMS_OTP_EXPORT = '1-otp-2',
    SMS_VOICESMS_NOALLOWED = '1-voice_sms-0',
    SMS_VOICESMS_VIEW = '1-voice_sms-1',
    SMS_VOICESMS_EXPORT = '1-voice_sms-2',
    SMS_VIRTUALNUMBER_NOALLOWED = '1-virtual_number-0',
    SMS_VIRTUALNUMBER_VIEW = '1-virtual_number-1',
    SMS_VIRTUALNUMBER_EXPORT = '1-virtual_number-2',
    SMS_TRANSACTIONLOGS_NOALLOWED = '1-transaction-logs-0',
    SMS_TRANSACTIONLOGS_VIEW = '1-transaction-logs-1',
    SMS_TRANSACTIONLOGS_EXPORT = '1-transaction-logs-2',
    SMS_EXPORTS_NOALLOWED = '1-exports-0',
    SMS_EXPORTS_VIEW = '1-exports-1',
    SMS_EXPORTS_EXPORT = '1-exports-2',
    SMS_SUBACCOUNT_USER = '1-subaccount-1',
    EMAIL_OUTBOUNDMAILS_NOALLOWED = '2-outbound_mails-0',
    EMAIL_OUTBOUNDMAILS_SEND = '2-outbound_mails-2',
    EMAIL_REPORTS_NOALLOWED = '2-reports-0',
    EMAIL_REPORTS_VIEW = '2-reports-1',
    EMAIL_REPORTS_EXPORT = '2-reports-2',
    EMAIL_TEMPLATES_NOALLOWED = '2-templates-0',
    EMAIL_TEMPLATES_VIEW = '2-templates-1',
    EMAIL_TEMPLATES_OPERATION = '2-templates-2',
    EMAIL_DOMAINS_NOALLOWED = '2-domains-0',
    EMAIL_DOMAINS_VIEW = '2-domains-1',
    EMAIL_DOMAINS_OPERATION = '2-domains-2',
    EMAIL_LOGS_NOALLOWED = '2-logs-0',
    EMAIL_LOGS_VIEW = '2-logs-1',
    EMAIL_LOGS_EXPORT = '2-logs-2',
    EMAIL_LOGS_MESSAGE = '2-logs-3',
    EMAIL_INBOUNDEMAILS_NOALLOWED = '2-inbound_emails-0',
    EMAIL_INBOUNDEMAILS_VIEW = '2-inbound_emails-1',
    EMAIL_INBOUNDEMAILS_EXPORT = '2-inbound_emails-2',
    EMAIL_WEBHOOKS_NOALLOWED = '2-webhooks-0',
    EMAIL_WEBHOOKS_VIEW = '2-webhooks-1',
    EMAIL_WEBHOOKS_OPERATION = '2-webhooks-2',
    EMAIL_ANALYTICS_NOALLOWED = '2-analytics-0',
    EMAIL_ANALYTICS_VIEW = '2-analytics-1',
    EMAIL_ANALYTICS_EXPORT = '2-analytics-2',
    EMAIL_SUPPRESSIONS_NOALLOWED = '2-suppressions-0',
    EMAIL_SUPPRESSIONS_VIEW = '2-suppressions-1',
    EMAIL_SUPPRESSIONS_OPERATION = '2-suppressions-2',
    EMAIL_RECIPIENT_VALIDATIONS_NOALLOWED = '2-recipient_validations-0',
    EMAIL_RECIPIENT_VALIDATIONS_VIEW = '2-recipient_validations-1',
    EMAIL_RECIPIENT_VALIDATIONS_OPERATION = '2-recipient_validations-2',
    VOICE_LOGS_NOALLOWED = '3-logs-0',
    VOICE_LOGS_VIEW = '3-logs-1',
    VOICE_LOGS_EXPORT = '3-logs-2',
    VOICE_LOGS_MESSAGE = '3-logs-3',
    VOICE_SENDVOICE_NOALLOWED = '3-send_voice-0',
    VOICE_SENDVOICE_SEND = '3-send_voice-2',
    VOICE_FILES_NOALLOWED = '3-files-0',
    VOICE_FILES_VIEW = '3-files-1',
    VOICE_FILES_OPERATION = '3-files-2',
    VOICE_TEMPLATES_NOALLOWED = '3-template-0',
    VOICE_TEMPLATES_VIEW = '3-template-1',
    VOICE_TEMPLATES_OPERATION = '3-template-2',
    VOICE_REPORTS_NOALLOWED = '3-reports-0',
    VOICE_REPORTS_VIEW = '3-reports-1',
    VOICE_REPORTS_EXPORT = '3-reports-2',
    WHATSAPP_LOGS_NOALLOWED = '4-logs-0',
    WHATSAPP_LOGS_VIEW = '4-logs-1',
    WHATSAPP_LOGS_EXPORT = '4-logs-2',
    WHATSAPP_LOGS_MESSAGE = '4-logs-3',
    WHATSAPP_SENDWHATSAPP_NOALLOWED = '4-send_whatsapp-0',
    WHATSAPP_SENDWHATSAPP_SEND = '4-send_whatsapp-2',
    RCS_LOGS_NOALLOWED = '5-logs-0',
    RCS_LOGS_VIEW = '5-logs-1',
    RCS_LOGS_EXPORT = '5-logs-2',
    RCS_LOGS_MESSAGE = '5-logs-3',
    RCS_SENDRCS_NOALLOWED = '5-send_rcs-0',
    RCS_SENDRCS_SEND = '5-send_rcs-2',
    CAMPAIGN_CAMPAIGN_NOALLOWED = '6-campaign-0',
    CAMPAIGN_CAMPAIGN_VIEW = '6-campaign-1',
    CAMPAIGN_CAMPAIGN_OPERATION = '6-campaign-2',
    CAMPAIGN_LOGS_NOALLOWED = '6-logs-0',
    CAMPAIGN_LOGS_VIEW = '6-logs-1',
    CAMPAIGN_LOGS_EXPORT = '6-logs-2',
    CAMPAIGN_LOGS_MESSAGE = '6-logs-3',
    CAMPAIGN_TOKEN_NOALLOWED = '6-26-0',
    CAMPAIGN_TOKEN_VIEW = '6-26-1',
    CAMPAIGN_TOKEN_OPERATION = '6-26-2',
    HELLO_KNOWLEDGEBASE_NOALLOWED = '7-knowledge_base-0',
    HELLO_KNOWLEDGEBASE_VIEW = '7-knowledge_base-1',
    HELLO_KNOWLEDGEBASE_OPERATION = '7-knowledge_base-2',
    HELLO_ANALYSIS_NOALLOWED = '7-analysis-0',
    HELLO_ANALYSIS_VIEW = '7-analysis-1',
    HELLO_ANALYSIS_EXPORT = '7-analysis-2',
    HELLO_INTEGRATION_NOALLOWED = '7-integrations-0',
    HELLO_INTEGRATION_VIEW = '7-integrations-1',
    HELLO_INTEGRATION_OPERATION = '7-integrations-2',
    HELLO_BLOCKEDCLIENT_NOALLOWED = '7-blocked_clients-0',
    HELLO_BLOCKEDCLIENT_VIEW = '7-blocked_clients-1',
    HELLO_BLOCKEDCLIENT_OPERATION = '7-blocked_clients-2',
    HELLO_CONTACTCENTER_NOALLOWED = '7-contact_center-0',
    HELLO_CONTACTCENTER_VIEW = '7-contact_center-1',
    HELLO_CONTACTCENTER_OPERATION = '7-contact_center-2',
    HELLO_VOICE_NOALLOWED = '7-voice-0',
    HELLO_VOICE_VIEW = '7-voice-1',
    HELLO_VOICE_OPERATION = '7-voice-2',
    HELLO_EMAILTICKET_NOALLOWED = '7-email_ticket-0',
    HELLO_EMAILTICKET_VIEW = '7-email_ticket-1',
    HELLO_EMAILTICKET_OPERATION = '7-email_ticket-2',
    HELLO_ANALYTICS_NOALLOWED = '7-analytics-0',
    HELLO_ANALYTICS_VIEW = '7-analytics-1',
    HELLO_ANALYTICS_EXPORT = '7-analytics-2',
    HELLO_TEAM_NOALLOWED = '7-team_manage-0',
    HELLO_TEAM_VIEW = '7-team_manage-1',
    HELLO_TEAM_OPERATION = '7-team_manage-2',
    HELLO_CLIENT_INFO_NOALLOWED = '7-client_info-0',
    HELLO_CLIENT_INFO_VIEW = '7-client_info-1',
    SEGMENTO_EXPORT_NOALLOWED = '8-export-0',
    SEGMENTO_EXPORT_EXPORT = '8-export-1',
    SEGMENTO_FIELD_NOALLOWED = '8-attributes-0',
    SEGMENTO_FIELD_UPDATE = '8-attributes-1',
    SEGMENTO_FIELD_DELETE = '8-attributes-2',
    SEGMENTO_CONTACTS_NOALLOWED = '8-contacts-0',
    SEGMENTO_CONTACTS_VIEW = '8-contacts-1',
    SEGMENTO_CONTACTS_OPERATION = '8-contacts-2',
    SEGMENTO_CONTACTS_DELETE = '8-contacts-3',
    SEGMENTO_AUTOMATION_NOALLOWED = '8-automation-0',
    SEGMENTO_AUTOMATION_VIEW = '8-automation-1',
    SEGMENTO_AUTOMATION_OPERATION = '8-automation-2',
    SEGMENTO_AUTOMATION_DELETE = '8-automation-3',
    SEGMENTO_COMMUNICATION_NOALLOWED = '8-campaigns-0',
    SEGMENTO_COMMUNICATION_VIEW = '8-campaigns-1',
    SEGMENTO_COMMUNICATION_RUN = '8-campaigns-2',
    SEGMENTO_PHONEBOOK_NOALLOWED = '8-phonebook-0',
    SEGMENTO_PHONEBOOK_OPERATION = '8-phonebook-1',
    SEGMENTO_PHONEBOOK_DELETE = '8-phonebook-2',
    SEGMENTO_SEGMENT_NOALLOWED = '8-segment-0',
    SEGMENTO_SEGMENT_VIEW = '8-segment-1',
    SEGMENTO_SEGMENT_OPERATION = '8-segment-2',
    SEGMENTO_SEGMENT_DELETE = '8-segment-3',
    SEGMENTO_SECURE_NOALLOWED = '8-secure_data-0',
    SEGMENTO_SECURE_VIEW = '8-secure_data-1',
    SEGMENTO_SECURE_UPDATE = '8-secure_data-2',
}

export enum FeatureRequestEnums {
    CAMPAIGNS = 'campaignone-api',
    EMAIL = 'email',
    HELLO = 'hello',
    RCS = 'rcs',
    SEGMENTO = 'segmento',
    SHORTURL = 'shorturl',
    SMS = 'sms',
    VOICE = 'voice',
    WHATSAPP = 'whatsapp',
    DASHBOARD = 'main-dashboard',
}

// export enum ApiDocumentationEnums {
//     EMAIL = 'i_CZBd5bG',
//     SMS = 'Irz7-x1PK',
//     RCS = 's9UPO7m9w',
//     OTP = 'B1NUt3C8MY',
//     WHATSAPP = '9yF5DNqR1',
//     SEGMENTO = '',
//     DASHBOARD = 'i_CZBd5bG',
// }

export enum ApiDocumentationEnums {
    EMAIL = 'send-email',
    SMS = 'send-sms',
    RCS = 'rcs-bulk-template',
    OTP = 'sendotp',
    WHATSAPP = 'send-message-in-text',
    SEGMENTO = 'createupdate-contact',
    DASHBOARD = 'overview',
    VOICE = 'send-voice-sms',
}

export enum HelpDoc {
    EMAIL = 'transactional-email',
    SMS = 'text-sms',
    RCS = 'rcs-form-registration-guide',
    OTP = 'sendotp',
    WHATSAPP = 'whatsapp',
    SEGMENTO = 'segmento',
    HELLO = 'hello-contact-center',
    CAMPAIGNS = 'what-is-campaign-and-how-to-use-it',
    SHORTURL = 'url-shortener',
    REPORTS = 'delivery-report',
    DASHBOARD = '',
}

export enum CalendlyLinks {
    // SMS = 'support--msg91/sms?embed_domain=test.msg91.com&hide_gdpr_banner=1&embed_type=Inline',
    // EMAIL = 'support--msg91/email?embed_domain=test.msg91.com&hide_gdpr_banner=1&embed_type=Inline',
    // RCS = 'support--msg91/whatsapp?embed_domain=test.msg91.com&hide_gdpr_banner=1&embed_type=Inline',
    // WHATSAPP = 'support--msg91/whatsapp?embed_domain=test.msg91.com&hide_gdpr_banner=1&embed_type=Inline',
    // DefaultLink = 'support--msg91/',
    DefaultLink = 'https://calendly.com/d/y3n-29s-29h?hide_gdpr_banner=1',
}

export enum MicroserviceIdEnum {
    SMS = 1,
    Email = 2,
    Voice = 3,
    WhatsApp = 4,
    RCS = 5,
    Campaign = 6,
    Hello = 7,
}

export enum InboxVendors {
    // Mailer = 'mailer',
    // SMTP = 'smtp',
    MSG91 = 'msg91',
    GMail = 'gmail',
    Zoho = 'zoho',
    Outlook = 'outlook',
}

export const Microservices = {
    1: 'SMS',
    2: 'Email',
    3: 'Voice',
    4: 'WhatsApp',
    5: 'RCS',
    6: 'Campaign',
    7: 'Hello',
};
