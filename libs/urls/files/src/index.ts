import { createUrl } from '@msg91/service';

export const AllFilesUrls = {
    file: (baseUrl: string) => createUrl(baseUrl, 'files/:id'),
    uploadFile: (baseUrl: string) => createUrl(baseUrl, 'folders/:parentId/files'),

    folder: (baseUrl: string) => createUrl(baseUrl, 'folders/:id'),
    createFolders: (baseUrl: string) => createUrl(baseUrl, 'folders/:parentId/subfolders'),
    folderFileAndFolder: (baseUrl: string) => createUrl(baseUrl, 'folders/:id/children'),

    generateSignedUrl: (baseUrl: string) => createUrl(baseUrl, 'folders/:id/signedUrls'),
    generateSignedUrlForUpdate: (baseUrl: string) => createUrl(baseUrl, 'files/:id/signedUrls'),
};
