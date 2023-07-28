import { createUrl } from '../../base-url';

export const AdminEmailTemplateUrls = {
    getAllTemplates: (baseUrl) => createUrl(baseUrl, 'templates?with=user'),
    getAllTemplatesVersions: (baseUrl) => createUrl(baseUrl, 'template-versions?with=template.user,reason'),
    template: (baseUrl) => createUrl(baseUrl, 'templates/:template_id'),
    templateVersion: (baseUrl) => createUrl(baseUrl, 'template-versions/:template_id'),
    rejectReason: (baseUrl) => createUrl(baseUrl, 'reasons'),
    rejectReasonParticular: (baseUrl) => createUrl(baseUrl, 'reasons/:rejectedReason'),
};
