export interface IClient {
    id: number;
    username: string;
    name: string;
    email_id: string;
    mobile: string;
    agent_count: number;
    team_count: number;
    service_count: number;
    email: IModeActiveStatus;
    voice: IModeActiveStatus;
    cobrowse: ICobrowseModeActiveStatus;
    wa: IModeActiveStatus;
    rcs: IModeActiveStatus;
    video: IModeActiveStatus;
    kb: IModeActiveStatus;
    status: 'active' | 'blocked';
}

export interface IModeActiveStatus {
    active: boolean;
    status: boolean;
}

export interface ICobrowseModeActiveStatus extends IModeActiveStatus {
    cobrowse_vendor: 'cobrowse' | 'hellomedian';
}

export interface IClientReq {
    email?: boolean;
    voice?: boolean;
    cobrowse?: boolean;
    cobrowse_vendor?: 'cobrowse' | 'hellomedian';
    wa?: boolean;
    rcs?: boolean;
    video?: boolean;
    status?: 'active' | 'blocked';
}

export interface ICount {
    company_id: number;
    username: string;
    mail_count: number;
    chat_count: number;
    voice_in_count: number;
    voice_out_count: number;
    cobrowse_count: number;
    video_count: number;
    article_count: number;
    rcs_count: number;
    fb_count: number;
    wa_count?: number;
}

export interface IHelloDashboardData {
    ticket_count: number;
    clients_count: number;
}

export interface IHelloDashboardGraph {
    chat: { count: number; series: { value: number; name: string | Date }[] };
    cobrowse: { count: number; series: { value: number; name: string | Date }[] };
    video: { count: number; series: { value: number; name: string | Date }[] };
    voice: { count: number; series: { value: number; name: string | Date }[] };
}

export interface IHelloReportGraph {
    chat: { count: number; series: { value: number; name: string | Date }[] };
    cobrowse: { count: number; series: { value: number; name: string | Date }[] };
    video: { count: number; series: { value: number; name: string | Date }[] };
    voice: { count: number; series: { value: number; name: string | Date }[] };
}

export interface SlotValue {
    value: string;
}
export interface SlotTypeValue {
    sampleValue: SlotValue;
    synonyms: Array<SlotValue>;
}
export interface SlotTypeCreateRequest {
    name: string;
    description: string;
    values: Array<SlotTypeValue>;
}
export interface SlotTypeCreateModel extends Omit<SlotTypeCreateRequest, 'values'> {
    values: Array<{
        sampleValue: string;
        synonyms: string;
    }>;
}
export interface SlotMessage {
    message: {
        plainTextMessage: {
            value: string;
        };
    };
}
export interface Slot {
    slot_id: number;
    slot_type_id: number;
    bot_id: number;
    intent_id: number;
    name: string;
    description: string;
    priority: number;
    message: Array<SlotMessage>;
    lex_slot_id: string;
}

export interface FulFillmentPayload {
    id: string | number;
    template_id: string | number;
    intent_id: string;
    slot_name: string;
    slot_id: string;
    variable_name: string;
    variable_id: string;
}

export interface FulFillment {
    fulfillment_enabled: boolean;
    fulfillment_response: string;
    failure_response: string;
    payload: Array<FulFillmentPayload>;
    template_id: number;
}
export interface IntentDetail {
    intent_id: number;
    intent_name: string;
    description: string;
    confirmation_prompt: string;
    decline_response: string;
    closing_response: string;
    sample_utterances: Array<{ utterance: string }>;
    slots: Array<Slot>;
    slot_priorities: Array<{ priority: number; slotId: string }>;
    fulfillment: FulFillment;
}
export interface SlotType extends SlotTypeCreateRequest {
    id: number;
}
export interface GetSlotResponse extends Slot {
    slot_types: SlotType;
}

export interface BotApiTemplateVariable {
    id: number;
    variable_name: string;
    template_id: number;
}

export interface BotApiTemplateKeys {
    bot_id: number;
    id: number;
    key_name: string;
    template_id: number;
}

export interface BotApiTemplate {
    name: string;
    id?: number;
    request: string;
    url: string;
    payload: { [key: string]: string };
    headers: { [key: string]: string };
    keys: Array<BotApiTemplateKeys>;
    bot_id: number;
    template_id?: number;
    variables?: Array<BotApiTemplateVariable>;
    body_updated?: boolean;
}
