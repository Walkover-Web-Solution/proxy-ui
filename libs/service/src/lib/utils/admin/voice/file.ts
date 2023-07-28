import { createUrl } from '../../base-url';

export const AdminVoiceFileUrls = {
    getAllFiles: (baseUrl) => createUrl(baseUrl, 'files/'),
    getFileVoice: (baseUrl) => createUrl(baseUrl, 'play/files/:fileId/versions/:versionId'),
    updateFileStatus: (baseUrl) => createUrl(baseUrl, 'files/:fileId/versions/:versionId'),
    fetchRejectionReasons: (baseUrl) => createUrl(baseUrl, 'files/rejection-reasons/'),
    addRejectionReason: (baseUrl) => createUrl(baseUrl, 'files/rejection-reasons/'),
    deleteRejectionReason: (baseUrl) => createUrl(baseUrl, 'files/rejection-reasons/:reasonId'),
};
