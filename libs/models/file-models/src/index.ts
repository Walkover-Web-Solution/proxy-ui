export type CreateMutable<Type> = {
    [Property in keyof Type]?: Type[Property];
};

export interface CustomFile {
    file: CreateMutable<File>;
    formattedFileSize: string;
    name: string;
    isUploaded?: boolean;
    hasError?: boolean;
    signedUrlObj?: GeneratedSignedUrlResModel;
}

export interface Pagination {
    pageNumber: number;
    pageSize: number;
    total: number;
}

export interface FilesOrFolder {
    companyId: string;
    createdAt: string;
    extension: string;
    id: number;
    key: string;
    name: string;
    parentId: number;
    size: number | string;
    type: string;
    updatedAt: string;
    sizeBytes?: string;
}

export interface Stats {
    fileCount: number;
    folderCount: number;
    totalUploadSize: number;
}

export interface FilesOrFolderResponse {
    stats: Stats;
    rows: FilesOrFolder[];
    pagination: Pagination;
}

export interface GenerateSignedUrlReqModel {
    contentType: string;
}

export interface GeneratedSignedUrlResModel {
    fileKey: string;
    signedUrl: string;
}
