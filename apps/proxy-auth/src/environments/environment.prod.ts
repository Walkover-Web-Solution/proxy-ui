export const environment = {
    production: true,
    env: 'prod',
    apiUrl: 'https://routes.msg91.com/api',
    baseUrl: 'https://proxy.msg91.com',
    msgMidProxy: '',
    uiEncodeKey: process.env.AUTH_UI_ENCODE_KEY,
    uiIvKey: process.env.AUTH_UI_IV_KEY,
    apiEncodeKey: process.env.AUTH_API_ENCODE_KEY,
    apiIvKey: process.env.AUTH_API_IV_KEY,
};
