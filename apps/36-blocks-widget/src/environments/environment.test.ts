import { envVariables } from './env-variables';

export const environment = {
    production: true,
    env: 'test',
    apiUrl: 'https://apitest.msg91.com/api',
    baseUrl: 'https://test.proxy.msg91.com',
    msgMidProxy: '',
    ...envVariables,
};
