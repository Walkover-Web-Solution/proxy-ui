// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
    production: false,
    env: 'local',
    firebaseConfig: {
        apiKey: process.env.FIREBASE_CONFIG_API_KEY,
        authDomain: process.env.FIREBASE_CONFIG_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_CONFIG_PROJECT_ID,
        storageBucket: process.env.FIREBASE_CONFIG_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_CONFIG_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_CONFIG_APP_ID,
    },
    proxyServer: 'https://test.proxy.msg91.com',
    baseUrl: 'https://apitest.msg91.com/api',
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
