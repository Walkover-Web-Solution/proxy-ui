import { createUrl } from '@msg91/service';

export const FilesReportsUrls = {
    files: (baseUrl) => createUrl(baseUrl, 'files/'),
    createFileVersions: (baseUrl) => createUrl(baseUrl, 'files/:fileId/versions/'),
    getFileVoice: (baseUrl) => createUrl(baseUrl, 'play/files/:fileId/versions/:versionId'),
    fileVersion: (baseUrl) => createUrl(baseUrl, 'files/:fileId/versions/:versionId'),
    getTtsLanguages: (baseUrl) => createUrl(baseUrl, 'language/tts/'),
    getSttLanguages: (baseUrl) => createUrl(baseUrl, 'language/stt/'),
    textToSpeechOnBrowser: (baseUrl) => createUrl(baseUrl, 'play/files/'),
    recordFileVersionFromPhone: (baseUrl) => createUrl(baseUrl, 'files/:fileId'),
};

export const VoiceReportsUrls = {
    getAllVoiceReports: (baseUrl) => createUrl(baseUrl, 'call-logs/'),
    callRecords: (baseUrl) => createUrl(baseUrl, 'call-logs/recording/:id'),
    columnsFilter: (baseUrl) => createUrl(baseUrl, 'call-logs/columns/'),
    getAgents: (baseUrl) => createUrl(baseUrl, 'api/v5/access/getUsersList/'),
    getTeams: (baseUrl) => createUrl(baseUrl, 'api/v5/hello/v2/teams/'),
};

export const TemplatesUrls = {
    templates: (baseUrl) => createUrl(baseUrl, 'templates/'),
    getVariableTypes: (baseUrl) => createUrl(baseUrl, 'template/variable-type'),
    updateTemplate: (baseUrl) => createUrl(baseUrl, 'templates/:templateId'),
    templateTestOnBrowser: (baseUrl) => createUrl(baseUrl, 'play/template/'),
};
