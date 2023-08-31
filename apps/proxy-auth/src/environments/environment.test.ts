// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    env: 'test',
    apiUrl: 'https://apitest.msg91.com/api',
    baseUrl: 'https://test.proxy.msg91.com',
    msgMidProxy: '',
    uiEncodeKey: process.env.AUTH_UI_ENCODE_KEY,
    uiIvKey: process.env.AUTH_UI_IV_KEY,
    apiEncodeKey: process.env.AUTH_API_ENCODE_KEY,
    apiIvKey: process.env.AUTH_API_IV_KEY,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
