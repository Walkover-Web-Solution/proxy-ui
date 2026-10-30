/** Compile-time replacement for the isolated review build. Contains no live configuration. */
export const environment = {
    production: false,
    env: 'local',
    baseUrl: '/review-api',
    proxyServer: '',
    googleClientId: '',
    interfaceScriptUrl: '',
    firebaseConfig: {},
} as unknown as typeof import('./environment').environment;
