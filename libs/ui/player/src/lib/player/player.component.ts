import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import * as dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';

@Component({
    selector: 'proxy-lib-audio-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerComponent implements OnInit, OnChanges {
    @Input() public playDirect = false;
    @Input() public filename: string;
    @Input() public isLoading: boolean;
    @Input() public isPlaying: boolean;
    @Input() public showDelete = true;
    @Input() public showDownload;
    @Input() public showPlay = true;
    @Input() public showTime = true;
    @Input() public totalDuration = '00:00';
    @Input() public duration = '00:00';
    @Input() public seconds = 0;
    @Input() public total = 0;
    @Input() public getBuffer: () => Blob | Observable<Blob>;
    @Input() public blobUrl: string;
    @Output() public play = new EventEmitter();
    @Output() public pause = new EventEmitter();
    @Output() public remove = new EventEmitter();
    @Output() public seek = new EventEmitter();
    @ViewChild('audio', { static: true }) public audio: ElementRef<HTMLAudioElement>;
    public isSeeking: boolean;
    public unsafeBlobUrl: string;
    private isError: boolean;
    @Output() public loadingInProcess = new EventEmitter();

    constructor(private sanitizer: DomSanitizer, private toast: PrimeNgToastService, private cdr: ChangeDetectorRef) {}

    /**
     * Initializes the component
     *
     * @memberof PlayerComponent
     */
    public ngOnInit(): void {
        this.totalDuration = this.secondsToDuration(this.total);
    }

    /**
     * Initializes the component
     *
     * @memberof PlayerComponent
     */
    public ngOnChanges(simpleChanges: SimpleChanges): void {
        if (simpleChanges.hasOwnProperty('playDirect')) {
            if (simpleChanges.playDirect.currentValue) {
                this.playAudio();
            }
        }
    }

    /**
     * This will clear audio
     *
     * @memberof PlayerComponent
     */
    public clearAudio(): void {
        this.unsafeBlobUrl = null;
        this.blobUrl = null;
    }

    /**
     * This will play audio
     *
     * @returns {void}
     * @memberof PlayerComponent
     */
    public playAudio(): void {
        this.play.emit();
        if (this.unsafeBlobUrl) {
            if (this.audio.nativeElement.ended || this.isError) {
                this.audio.nativeElement.src = this.unsafeBlobUrl;
            }
            this.audio.nativeElement.play().then(() => {
                this.isError = false;
                this.isPlaying = true;
            });
            return;
        }
        this.isLoading = true;
        this.loadingInProcess.emit(this.isLoading);
        const onError = (e) => {
            this.isError = true;
            this.isLoading = false;
            this.loadingInProcess.emit(this.isLoading);
            this.isPlaying = false;
            this.toast.error(
                e.status
                    ? 'No recording found'
                    : e.message || (e.target && e.target.error ? e.target.error.message : '') || e?.errors
            );
        };
        const onPaused = (e) => {
            this.isPlaying = false;
        };
        const onEnded = (e) => {
            this.isPlaying = false;
            this.seconds = 0;
            this.duration = '00:00';
            this.cdr.detectChanges();
        };
        const canPlay = () => {
            const currentDuration = this.decideWhichValueToUse(this.audio.nativeElement.duration);
            this.totalDuration = this.secondsToDuration(currentDuration);
            this.audio.nativeElement
                .play()
                .then(() => {
                    this.isPlaying = true;
                    this.isLoading = false;
                    this.loadingInProcess.emit(this.isLoading);
                    this.isError = false;
                })
                .catch(onError);
        };
        const res = this.getBuffer();
        if (res instanceof Blob) {
            this.audio.nativeElement.src = this.unsafeBlobUrl = URL.createObjectURL(res);
            // @ts-ignore
            this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res));
            this.audio.nativeElement.addEventListener('error', onError);
            this.audio.nativeElement.addEventListener('ended', onEnded);
            this.audio.nativeElement.addEventListener('paused', onPaused);
            this.audio.nativeElement.addEventListener('canplay', canPlay);
            this.isLoading = false;
            this.loadingInProcess.emit(this.isLoading);
        } else if (res instanceof Observable) {
            res.subscribe((audioData) => {
                this.audio.nativeElement.src = this.unsafeBlobUrl = URL.createObjectURL(audioData);
                // @ts-ignore
                this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(audioData));
                this.audio.nativeElement.addEventListener('error', onError);
                this.audio.nativeElement.addEventListener('ended', onEnded);
                this.audio.nativeElement.addEventListener('paused', onPaused);
                this.audio.nativeElement.addEventListener('canplay', canPlay);
            }, onError);
        }
    }

    /**
     * This will pause audio
     *
     * @memberof PlayerComponent
     */
    public pauseAudio = () => {
        this.pause.emit();
        if (this.isSeeking) {
            return;
        }
        if (this.isPlaying) {
            if (this.blobUrl) {
                this.audio.nativeElement.pause();
                this.isPlaying = false;
            }
        }
    };

    /**
     * Converts seconds into duration string
     *
     * @param {number} seconds
     * @returns {string}
     * @memberof PlayerComponent
     */
    public secondsToDuration(seconds: number): string {
        if (seconds) {
            return dayjs().startOf('day').second(seconds).format('mm:ss');
        }
        return '00:00';
    }

    /**
     * This will seek audio
     *
     * @param {number} e
     * @memberof PlayerComponent
     */
    public seekAudio(e: number): void {
        this.seek.emit(e);
        this.seconds = e;
        this.isSeeking = true;
        this.duration = this.secondsToDuration(e);
        if (this.blobUrl) {
            this.audio.nativeElement.currentTime = e;
        }
        this.isSeeking = false;
    }

    /**
     * This will update audio duration
     *
     * @returns {void}
     * @memberof PlayerComponent
     */
    public updateDuration(): void {
        if (this.isSeeking) {
            return;
        }
        this.seconds = this.audio.nativeElement.currentTime;
        const value = this.decideWhichValueToUse(this.audio.nativeElement.currentTime);
        this.duration = this.secondsToDuration(value);
        this.total = this.audio.nativeElement.duration;
    }

    /**
     * This will return total duration by condition
     *
     * @returns {number}
     * @memberof PlayerComponent
     */
    public decideWhichValueToUse(e: number): number {
        const duration = e.toString().split('.');
        return +duration[0] > 0 ? e : 1;
    }
}
