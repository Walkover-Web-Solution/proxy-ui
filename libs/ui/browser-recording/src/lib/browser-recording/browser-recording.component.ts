import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { PlayerComponent } from '@proxy/ui/player';
import { Subject } from 'rxjs';

@Component({
    selector: 'proxy-browser-recording',
    templateUrl: './browser-recording.component.html',
    styleUrls: ['./browser-recording.component.scss'],
})
export class BrowserRecordingComponent implements OnDestroy {
    public browserRecName: string;

    @Input() public isRecording = false;
    @Input() public isRecordingFailed: boolean;
    @Input() public blob: Blob;
    @Input() public isRecordUploadFileInProgress: boolean;
    @Input() public isUploadFileInProgress: boolean;
    @Input() public hideUploadButton: boolean;
    @Input() public supportedFileExtensionMessage = 'Only .gsm, .wav & .mp3 files are supported.';
    @Input() public supportedFileExtensions = '.mp3,audio/*';
    @Input() public showUploadFileSection = true;

    @Output() public recordingStarted: EventEmitter<void> = new EventEmitter();
    @Output() public recordingAborted: EventEmitter<void> = new EventEmitter();
    @Output() public recordingStopped: EventEmitter<void> = new EventEmitter();
    @Output() public recordingDeleted: EventEmitter<void> = new EventEmitter();
    @Output() public recordingUploaded: EventEmitter<{ blob: Blob; browserRecName: string }> = new EventEmitter();
    @Output() public recordingUploadInit: EventEmitter<{ item: File | null; index: number; files: FileList }> =
        new EventEmitter();

    @ViewChild('audio', { static: false }) public audio: PlayerComponent;

    private files: any = [];
    private destroy$: Subject<boolean> = new Subject();

    @Output() public nameEmitter: EventEmitter<string> = new EventEmitter();

    startRecording() {
        if (!this.isRecording) {
            this.isRecording = true;
            this.recordingStarted.emit();
        }
    }

    abortRecording() {
        if (this.isRecording) {
            this.isRecording = false;
            this.recordingAborted.emit();
        }
    }

    stopRecording() {
        if (this.isRecording) {
            this.isRecording = false;
            this.recordingStopped.emit();
        }
    }

    clearRecordedData() {
        this.blob = null;
        this.recordingDeleted.emit();
    }

    ngOnDestroy(): void {
        this.abortRecording();
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    uploadRecording() {
        this.isRecordUploadFileInProgress = true;
        this.recordingUploaded.emit({
            blob: this.blob,
            browserRecName: this.browserRecName,
        });
    }

    getBuffer = () => this.blob;

    playRecording() {
        // console.log(this.audio);
        this.audio.playAudio();
        /*  if (this.audio.nativeElement && (!this.audio.nativeElement.paused)) {
        this.audio.nativeElement.pause();
        // this.audio = null;
        return;
      }
      // this.audio = new Audio(URL.createObjectURL(this.blob));
      this.audio.nativeElement.src = URL.createObjectURL(this.blob);
      let interval;
      this.audio.nativeElement.load();
      this.audio.nativeElement.addEventListener('canplay', () => {
        this.audio.nativeElement.play()
          .then(() => {
            interval = setInterval(() => console.log(this.audio.nativeElement.currentTime, this.audio.nativeElement.duration, this.audio.nativeElement.ended, this.audio.nativeElement.paused), 100);
          });
      });
      this.audio.nativeElement.addEventListener('pause', () => {
     // console.log('pause');
        clearInterval(interval);
      });

      this.audio.nativeElement.addEventListener('ended', () => {
     // console.log('ended');
        clearInterval(interval);
      });*/
    }

    public onUploadInit(files: FileList): void {
        this.recordingUploadInit.emit({
            item: null,
            index: 0,
            files,
        });
        if (files.length) {
            for (let i = 0; i < files.length; i++) {
                this.isUploadFileInProgress = true;
                this.files.push({ name: files.item(i).name });
                this.recordingUploadInit.emit({
                    item: files.item(i),
                    index: i,
                    files,
                });
            }
        }
    }

    public onModelChange(name: string) {
        this.nameEmitter.emit(name);
    }
}
