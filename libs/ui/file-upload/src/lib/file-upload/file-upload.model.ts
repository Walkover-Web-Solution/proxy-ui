export enum FileUploadErrorType {
    InvalidFileType,
    MaxSizeExceeded,
}
export interface FileUploadError {
    type: FileUploadErrorType;
    message: string;
}
export enum FileSizeUnit {
    Byte = 'byte',
    KiloByte = 'kB',
    MegaByte = 'MB',
    GigaByte = 'GB',
}
export interface FileSize {
    type: FileSizeUnit;
    value: number;
}
export interface FileUpload {
    isUploadInProgress: boolean;
    file?: File;
    fileArray?: Array<string>;
    headers?: Array<string>;
    errors?: boolean;
}
