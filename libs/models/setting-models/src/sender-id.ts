export interface ISenderIdConfig {
    id: string;
    user_id: string;
    route: string;
    sender_id: string;
    brand_name: string;
    company_name: string;
    website_url: string;
    status: '0' | '1';
    country_name: string;
    country_id: string;
    status_text: string;
    senderIdStatusCountryWise?: ISenderConfigInfo[];
    senderIdStatusCountryWiseInProcess?: boolean;
    exapandStatus: 'collapsed' | 'expanded';
}

export interface ISenderId {
    sender_id: string;
}

export interface ISenderConfigInfo {
    countries: string;
    sender_id: string;
    entity_id: string;
    status: string;
}

export interface IDefaultSenderIdResModel {
    msg: string;
    msgType: string;
}

export interface ISenderIdStatusCountryWiseReqModel {
    id: number;
}

export interface IAddSenderIdReqModel {
    destination_countries: IDestinationCountry[];
    more_than_ten_countries: boolean | 0 | 1;
    company_name: string;
    brand_name: string;
    website_url: string;
    logo: string;
}

export interface IDestinationCountry {
    country_id: string;
    sender_id: string;
    entity_id: string;
}

export interface IAddSenderIdResModel {
    data: string;
}

export interface ICountriesWithCodeResModel {
    code: number;
    name: string;
    type: string;
    length: string;
}

export interface IWebsiteUrlResModel {
    data: string[];
}

export interface IGetSenderIdDataReqModel {
    id: number;
}

export interface IGetSenderIdDataResModel {
    id: number;
    route: string;
    destinationCountries: IDestinationCountry[];
    company_name: string;
    brand_name: string;
    logo: string;
}

export interface IDestinationCountry {
    country_id: string;
    sender_id: string;
    entity_id: string;
}

export interface IUpdateSenderIdReqModel extends IAddSenderIdReqModel {
    id: number;
}
