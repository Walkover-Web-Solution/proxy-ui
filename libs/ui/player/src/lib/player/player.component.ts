import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    effect,
    inject,
    input,
    output,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';

@Component({
    selector: 'proxy-lib-audio-player',
    imports: [MatProgressSpinnerModule, MatButtonModule, MatIconModule],
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerComponent implements OnInit {
    public playDirect = input<boolean>(false);
    public filename = input<string>();
    public showDelete = input<boolean>(true);
    public showDownload = input<unknown>();
    public showPlay = input<boolean>(true);
    public showTime = input<boolean>(true);
    public getBuffer = input<() => Blob | Observable<Blob>>();

    public play = output<void>();
    public pause = output<void>();
    public remove = output<void>();
    public seek = output<number>();
    public loadingInProcess = output<boolean>();

    @ViewChild('audio', { static: true }) public audio: ElementRef<HTMLAudioElement>;
    public isSeeking: boolean;
    public unsafeBlobUrl: string;
    public isLoading: boolean;
    public isPlaying: boolean;
    public totalDuration = '00:00';
    public duration = '00:00';
    public seconds = 0;
    public total = 0;
    public blobUrl: string;
    private isError: boolean;

    private sanitizer = inject(DomSanitizer);
    private toast = inject(PrimeNgToastService);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        effect(() => {
            if (this.playDirect()) {
                this.playAudio();
            }
        });
    }

    /**
     * Initializes the component
     *
     * @memberof PlayerComponent
     */
    public ngOnInit(): void {
        this.totalDuration = this.secondsToDuration(this.total);
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
