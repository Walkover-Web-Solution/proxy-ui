import { createUrl } from '../../base-url';

export const AdminEmailBlockKeywordsUrls = {
    blockKeywords: (baseUrl) => createUrl(baseUrl, 'abusive-words'),
    deleteBlockKeyword: (baseUrl) => createUrl(baseUrl, 'abusive-words/:blockKeywordId'),
    getAllKeywords: (baseUrl) => createUrl(baseUrl, 'keywords'),
    addKeywords: (baseUrl) => createUrl(baseUrl, 'keywords'),
    updateKeyword: (baseUrl) => createUrl(baseUrl, 'keywords/:id'),
    deleteKeyword: (baseUrl) => createUrl(baseUrl, 'keywords/:id'),
};
