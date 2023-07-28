import { createUrl } from '@msg91/service';

export const FileUploadUrls = {
    fileUploadUrl: (baseUrl) => createUrl(baseUrl, 'upload-file'),
};
