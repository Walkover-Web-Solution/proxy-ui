//#region POST :: /send-rcs-message/
export interface ISendMessageReqModel {
    customer_number: string;
    function_name: string;
    company_id: string;
    text: string;
}

//#endregion

//#region POST (Suggested Replies) :: /send-rcs-message/
export interface ISendMessageSuggestedRepliesReqModel {
    customer_number: string;
    function_name: string;
    company_id: string;
    text: string;
    replies_list: string[];
}

//#endregion

//#region Response (dial) :: /send-rcs-message/
export interface ISendMessageSuggestedRepliesResModel {
    sent_time: string;
    result: string;
}

//#endregion

//#region POST (Suggested Replies) :: /send-rcs-message/

export interface ISendMessageDialReqModel {
    customer_number: string;
    function_name: string;
    company_id: string;
    text: string;
    dial_number: string;
    text_to_show: string;
}

//#endregion

//#region Response (dial) :: /send-rcs-message/
export interface ISendMessageDialResModel {
    sent_time: string;
    result: string;
}

//#endregion

//#region POST (View location) :: /send-rcs-message/
export interface IViewLocationReqModel {
    customer_number: string;
    function_name: string;
    company_id: string;
    text: string;
    text_to_show: string;
    location_query: string;
}

//#endregion

//#region Response (View location) :: /send-rcs-message/
export interface IViewLocationResModel {
    sent_time: string;
    result: string;
}

//#endregion

//#region POST (Share location) :: /send-rcs-message/
export interface IShareLocationReqModel {
    customer_number: string;
    function_name: string;
    company_id: string;
    text: string;
    text_to_show: string;
}

//#endregion

//#region Response (Share location) :: /send-rcs-message/
export interface IShareLocationResModel {
    sent_time: string;
    result: string;
}

//#endregion

//#region POST (Open Url) :: /send-rcs-message/

export interface IOpenUrlReqModel {
    customer_number: string;
    function_name: string;
    company_id: string;
    text: string;
    text_to_show: string;
    url: string;
}

//#endregion

//#region Response (Open Url) :: /send-rcs-message/
export interface IOpenUrlResModel {
    sent_time: string;
    result: string;
}

//#endregion

//#region POST (Calander Event ) :: /send-rcs-message/
export interface ICalanderEventReqModel {
    customer_number: string;
    function_name: string;
    company_id: string;
    text: string;
    text_to_show: string;
    start_time: Date;
    end_time: Date;
    title: string;
    description: string;
}

//#endregion

//#region Response (Calander Event) :: /send-rcs-message/
export interface ICalanderEventResModel {
    sent_time: string;
    result: string;
}

//#endregion

//#region POST (carousel ) :: /send-rcs-message/
export interface ICarouselReqModel {
    customer_number: string;
    function_name: string;
    company_id: string;
    image_urls: string[];
    replies_list_of_list: string[][];
    titles: string[];
    descriptions: string[];
}

//#endregion

//#region Response (carousel) :: /send-rcs-message/
export interface ICarouselResModel {
    sent_time: string;
    result: string;
    function_name: string;
    media_url: string[];
    replies_list_of_list: string[][];
    titles: string[];
    descriptions: string[];
}

//#endregion

//#region POST (Rich Card ) :: /send-rcs-message/
export interface IRichCardReqModel {
    customer_number: string;
    function_name: string;
    company_id: string;
    media_url: string;
    replies_list: string[];
    title: string;
    description: string;
}

//#endregion

//#region Response (Rich Card) :: /send-rcs-message/
export interface IRichCardResModel {
    sent_time: string;
    result: string;
    function_name: string;
    media_url: string;
    replies_list: string[];
    title: string;
    description: string;
}

//#endregion

//#region POST (Media ) :: /send-rcs-message/
export interface IMediaReqModel {
    customer_number: string;
    function_name: string;
    company_id: string;
    media_url: string;
}

//#endregion

//#region Response (Media) :: /send-rcs-message/
export interface IMediaResModel {
    message: string;
}

//#endregion
