import { envVariables } from './env-variables';

export const environment = {
    production: true,
    env: 'test',
    googleClientId: '',
    proxyServer: 'https://stage.36blocks.com',
    baseUrl: 'https://apitest.msg91.com/api',
    ...envVariables,
};
