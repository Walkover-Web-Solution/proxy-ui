export const envVariables = {
    firebaseConfig: {
        apiKey: process.env.FIREBASE_CONFIG_API_KEY,
        authDomain: process.env.FIREBASE_CONFIG_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_CONFIG_PROJECT_ID,
        storageBucket: process.env.FIREBASE_CONFIG_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_CONFIG_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_CONFIG_APP_ID,
    },

    // VIASOCKET INTERFACE
    interfaceOrgId: process.env.INTERFACE_ORG_ID,
    interfaceChatBotId: process.env.INTERFACE_CHATBOT_ID,
    interfaceSecret: process.env.INTERFACE_SECRET,
    interfaceScriptUrl: process.env.INTERFACE_SCRIPT_URL,
};
