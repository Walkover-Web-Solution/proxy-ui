import { createUrl } from '@msg91/service';

export const RecipientValidationUrls = {
    checkSingleMailValidation: (baseUrl) => createUrl(baseUrl, 'validate'),
    checkBulkMailValidation: (baseUrl) => createUrl(baseUrl, 'validate-bulk'),
    getValidationLogs: (baseUrl) => createUrl(baseUrl, 'validation-logs'),
    getValidationReports: (baseUrl) => createUrl(baseUrl, 'validation-analytics'),
    getValidationTerminology: (baseUrl) => createUrl(baseUrl, 'terminology'),
    deleteValidationFile: (baseUrl) => createUrl(baseUrl, 'validation'),
};
