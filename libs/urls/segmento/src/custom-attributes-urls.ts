import { createUrl } from '@msg91/service';

export const CustomAttributesUrls = {
    getCustomAttributesUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/fields'),
    addCustomAttributeUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/fields'),
    // addCustomAttributeFieldTypesUrl: (baseUrl) => createUrl(baseUrl, 'api/v5/phonebook/:phoneBookId/fieldTypes'),
    // as per palash now full end point change.
    addCustomAttributeFieldTypesUrl: (baseUrl) => createUrl(baseUrl, 'fieldTypes'),
    // For Update and delete
    updateCustomAttributesUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/fields/:fieldId'),
    // For Restoring the field
    restoreCustomAttributesUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/fields/:fieldId/restore'),
    updateCustomAttributesBulkSaveUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/fields/bulkSave'),
};
