import { createUrl } from '@msg91/service';

export const ContactUrls = {
    getAllContactsUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/contacts/filters'),
    addContactsUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/contacts'),
    updateContactsUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/contacts/:contactId'),
    getContactDetailUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/contacts/:contactId'),
    deleteContactUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/contacts/:contactId'),
    getContactByFilterUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/filtereddata'),
    uploadContactsByFileUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/contacts/import'),
    getExportUrlForContactFileUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/export'),
    deleteBulkContactUrl: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phoneBookId/contacts'),
    importLogsStatus: (baseUrl) => createUrl(baseUrl, 'uploadFileLogStatuses'),
    getCodeSnippet: (baseUrl) => createUrl(baseUrl, 'phonebooks/:phonebookId/contacts/snippet/:crudType'),
};
