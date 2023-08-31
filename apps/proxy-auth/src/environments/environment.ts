// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    env: 'local',
    apiUrl: 'https://apitest.msg91.com/api',
    baseUrl: 'https://test.msg91.com',
    msgMidProxy: '',
    uiEncodeKey: '2a0365359f1238a919ddcac809b2014a',
    uiIvKey: 'b958a109cb67c42c',
    apiEncodeKey: '775c178c51ce020bfe01320bf2aaf6d9',
    apiIvKey: '1891f0c803b5f1a9',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
