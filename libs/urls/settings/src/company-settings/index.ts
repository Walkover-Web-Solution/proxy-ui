import { createUrl } from '@msg91/service';

export const CompanySettingUrls = {
    getUserInfo: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getCompanyInfo'),
    getCompanySettingUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/companySetting'),
    createCompanySettingUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/updateCompanySetting'),
    getAllCountriesUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getCountries'),
    getStatesByCountryIdUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getStatesByCountryId/:countryId'),
    checkUsernameAvailabilityUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/checkUsernameAvailability'),
    changeUserPasswordUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/changeCompanyPassword'),
    getAllIndustriesUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getIndustry/:searchKey'),
    getAllTimezoneUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getAlltimeZone'),
    forgotCompanyPassword: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/forgotCompanyPassword'),
    segmentoRegisterUser: (baseUrl) => createUrl(baseUrl, 'api/v5/segmento/register'),
    rcsUserActive: (baseUrl) => createUrl(baseUrl, 'rcs-status/'),
    campaignRegisterUser: (baseUrl) => createUrl(baseUrl, 'api/v5/campaign/register'),
    whatsAppUserActive: (baseUrl) => createUrl(baseUrl, 'whatsapp-status/'),
    getIntegratedGateways: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getPaymentGateways'),
    getCityByStateIdUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/panel/getCitiesByStateId/:stateId'),
};
