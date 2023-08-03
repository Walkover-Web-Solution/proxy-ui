import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FILE_SIZE } from '@proxy/constant/file-size';
import { FileSize, FileSizeUnit, FileUpload, FileUploadError, FileUploadErrorType } from './file-upload.model';

@Component({
    selector: 'proxy-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit, OnChanges {
    /** Type of the files supported to be uploaded */
    @Input() public fileType = ['text/csv', 'application/vnd.ms-excel'];
    /** Stores the custo errors to be shown after file upload */
    @Input() public customErrors: Array<FileUploadError>;
    /** Max value of file size */
    @Input() public maxFileSize: FileSize = { type: FileSizeUnit.MegaByte, value: 10 };
    /** Accept type of file */
    @Input() public acceptType = '.csv';
    /** Uplaoded file instance */
    @Input() public file: File;
    /** True, if file is dragged and dropped */
    @Input() public fileDragged: boolean;

    /** Emits when the file is successfully uploaded */
    @Output() public fileUploaded: EventEmitter<FileUpload> = new EventEmitter();

    /** Stores the instance of file input field */
    @ViewChild('fileInput') public fileInput: ElementRef<HTMLInputElement>;

    /** Stores the errors in uploaded file */
    public errors: Array<FileUploadError>;
    /** Error message */
    public errorMessage: string;

    constructor() {}

    /**
     * Initializes the error message based on the config provided
     *
     * @memberof FileUploadComponent
     */
    public ngOnInit(): void {
        this.initializeErrorMsg();
    }

    /**
     * Reads the file provided by the parent
     *
     * @param {SimpleChanges} changes Changes object
     * @memberof FileUploadComponent
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if ('file' in changes && changes.file.currentValue !== changes.file.previousValue && this.fileDragged) {
            this.readFile();
        }
    }

    /**
     * Starts the upload file flow
     *
     * @memberof FileUploadComponent
     */
    public startUpload(): void {
        this.fileInput?.nativeElement?.click();
    }

    /**
     * Reads the uploaded file
     *
     * @param {*} fileInputEvent File input event
     * @return {*}  {void}
     * @memberof FileUploadComponent
     */
    public uploadFile(fileInputEvent: any): void {
        this.fileUploaded.emit({
            isUploadInProgress: true,
        });
        this.file = fileInputEvent.target.files[0];
        this.readFile();
    }

    /**
     * Convers the uploaded CSV to array
     *
     * @param {string} str String format of CSV
     * @param {string} [delimiter=','] Delimiter to split the file array
     * @return {{[key: string]: Array<string>}} Header and other content of the CSV
     * @memberof FileUploadComponent
     */
    public csvToArray(str: string, delimiter: string = ','): { [key: string]: Array<string> } {
        const headers = str.slice(0, str.indexOf('\n')).split(delimiter);
        const rows = str.split('\n');
        let arr = [];
        arr = rows.map((row) => {
            const values = row.split(delimiter);
            return values;
        });
        return {
            headers,
            rows: arr,
        };
    }

    /**
     * Initializes the error message based on configuration provided
     *
     * @private
     * @memberof FileUploadComponent
     */
    private initializeErrorMsg(): void {
        let maxFileSizeErrorMessage = '1 kB';
        if (this.maxFileSize?.type && this.maxFileSize?.value) {
            maxFileSizeErrorMessage = `${this.maxFileSize.value} ${this.maxFileSize.type}`;
        }
        this.errors = [
            { type: FileUploadErrorType.InvalidFileType, message: 'Only CSV files allowed.' },
            {
                type: FileUploadErrorType.MaxSizeExceeded,
                message: `Note: File should not exceed more than ${maxFileSizeErrorMessage}`,
            },
        ];
    }

    /**
     * Checks if the uploaded file is valid as per configuration provided
     *
     * @private
     * @return {boolean} True, if the file is uploaded
     * @memberof FileUploadComponent
     */
    private isValidFile(): boolean {
        return !this.isInvalidType() && !this.isMaxSizeExceeded();
    }

    /**
     * Checks if the uplaoded file has correct type
     *
     * @private
     * @return {boolean} True, if uploaded file is of incorrect type
     * @memberof FileUploadComponent
     */
    private isInvalidType(): boolean {
        if (!this.fileType.includes(this.file.type)) {
            this.errorMessage = this.errors.find(
                (error) => error.type === FileUploadErrorType.InvalidFileType
            )?.message;
            if (this.customErrors?.length) {
                this.errorMessage =
                    this.customErrors.find((error) => error.type === FileUploadErrorType.InvalidFileType)?.message ??
                    '';
            }
            return true;
        }
        this.errorMessage = null;
        return false;
    }

    /**
     * Checks if uploaded file is greater than max limit
     *
     * @private
     * @return {boolean} True, if max size is exceeded
     * @memberof FileUploadComponent
     */
    private isMaxSizeExceeded(): boolean {
        const maxFileSizeInBytes =
            this.maxFileSize.type === FileSizeUnit.Byte
                ? this.maxFileSize.value * FILE_SIZE.ONE_BYTE
                : this.maxFileSize.type === FileSizeUnit.KiloByte
                ? this.maxFileSize.value * FILE_SIZE.ONE_KILOBYTE
                : this.maxFileSize.type === FileSizeUnit.MegaByte
                ? this.maxFileSize.value * FILE_SIZE.ONE_MB
                : this.maxFileSize.type === FileSizeUnit.GigaByte
                ? this.maxFileSize.value * FILE_SIZE.ONE_GB
                : 0;
        if (this.file.size > maxFileSizeInBytes) {
            this.errorMessage = this.errors.find(
                (error) => error.type === FileUploadErrorType.MaxSizeExceeded
            )?.message;
            if (this.customErrors?.length) {
                this.errorMessage =
                    this.customErrors.find((error) => error.type === FileUploadErrorType.MaxSizeExceeded)?.message ??
                    '';
            }
            return true;
        }
        this.errorMessage = null;
        return false;
    }

    /**
     * Performs the read file operation
     *
     * @private
     * @return {void}
     * @memberof FileUploadComponent
     */
    private readFile(): void {
        if (this.file) {
            if (!this.isValidFile()) {
                this.fileUploaded.emit({
                    isUploadInProgress: false,
                    errors: true,
                });
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                if (this.acceptType === '.csv') {
                    const text: any = event.target.result;
                    const data = this.csvToArray(text);
                    this.fileUploaded.emit({
                        file: this.file,
                        fileArray: data.rows,
                        headers: data.headers,
                        isUploadInProgress: false,
                    });
                }
            };
            reader.readAsText(this.file);
        }
    }
}
