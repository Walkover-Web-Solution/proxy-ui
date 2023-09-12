import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'proxy-upload-attached-file-preview',
    templateUrl: './upload-attached-file-preview.component.html',
    styleUrls: ['./upload-attached-file-preview.component.scss'],
})
export class UploadAttachedFilePreviewComponent implements OnInit {
    /** File upload preview details */
    @Input() public filePreviewDetails;
    /** Emits when the preview delete */
    @Output() public deleteFile: EventEmitter<any> = new EventEmitter();

    constructor() {}

    public ngOnInit(): void {}
}
