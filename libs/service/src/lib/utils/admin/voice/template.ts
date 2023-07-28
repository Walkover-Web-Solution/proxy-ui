import { createUrl } from '../../base-url';

export const AdminVoiceTemplateUrls = {
    getAllTemplates: (baseUrl) => createUrl(baseUrl, 'templates/'),
    templateTestOnBrowser: (baseUrl) => createUrl(baseUrl, 'play/templates/:templateId'),
};
