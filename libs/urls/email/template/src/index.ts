import { createUrl } from '@msg91/service';

export const TemplateUrls = {
    getAllTemplatesUrl: (baseUrl) => createUrl(baseUrl, 'templates'),
    addTemplateUrl: (baseUrl) => createUrl(baseUrl, 'templates'),
    getTemplateByIdUrl: (baseUrl) => createUrl(baseUrl, 'templates/:templateId'),
    TemplateUrl: (baseUrl) => createUrl(baseUrl, 'templates/:templateId'),
    getAllTemplateTheme: (baseUrl) => createUrl(baseUrl, 'template-themes'),
    templateTheme: (baseUrl) => createUrl(baseUrl, 'template-themes/:themeId'),
    getBlockKeywords: (baseUrl) => createUrl(baseUrl, 'abusive-words'),
    updateTemplateVersion: (baseUrl) => createUrl(baseUrl, 'template-versions'),
    specifiedTemplateVersion: (baseUrl) => createUrl(baseUrl, 'template-versions/:tempVersId'),
    testEmailTemplate: (baseUrl) => createUrl(baseUrl, 'send-test'),
    getStripoToken: (baseUrl) => createUrl(baseUrl, 'templates/getStripoToken'),
};
