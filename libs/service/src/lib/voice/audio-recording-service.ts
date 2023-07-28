import { Injectable } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import { Observable, Subject } from 'rxjs';
import { VoiceLibServiceModule } from './voice.module';

declare var lamejs: any;
dayjs.extend(duration);
interface RecordedAudioOutput {
    blob: Blob;
    title: string;
}

@Injectable({
    providedIn: VoiceLibServiceModule,
})
export class AudioRecordingService {
    private stream;
    private recorder;
    private interval;
    private startTime;
    private _recorded = new Subject<RecordedAudioOutput>();
    private _recordingTime = new Subject<string>();
    private _recordingFailed = new Subject<void>();

    getRecordedBlob(): Observable<RecordedAudioOutput> {
        return this._recorded.asObservable();
    }

    getRecordedTime(): Observable<string> {
        return this._recordingTime.asObservable();
    }

    recordingFailed(): Observable<void> {
        return this._recordingFailed.asObservable();
    }

    startRecording(mimeType: string = 'audio/mpeg', config: any = {}) {
        if (this.recorder) {
            // It means recording is already started or it is already recording something
            return;
        }

        this._recordingTime.next('00:00');
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((s) => {
                this.stream = s;
                this.record(mimeType, config);
            })
            .catch((error) => {
                this._recordingFailed.next();
            });
    }

    abortRecording() {
        this.stopMedia();
    }

    private record(mimeType: string, config: any = {}) {
        this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
            numberOfAudioChannels: 1,
            type: 'audio',
            mimeType: mimeType,
            ...config,
        });

        this.recorder.record();
        this.startTime = dayjs();
        this.interval = setInterval(() => {
            const currentTime = dayjs();
            const diffTime = dayjs.duration(currentTime.diff(this.startTime));
            const time = this.toString(diffTime.minutes()) + ':' + this.toString(diffTime.seconds());
            this._recordingTime.next(time);
        }, 1000);
    }

    private toString(value) {
        let val = value;
        if (!value) {
            val = '00';
        }
        if (value < 10) {
            val = '0' + value;
        }
        return val;
    }

    stopRecording(disableMp3Encoding: boolean = false, fileExtension: string = '.wav') {
        if (this.recorder) {
            this.recorder.stop(
                (blob) => {
                    if (this.startTime) {
                        const reader = new FileReader();
                        reader.onload = (event: any) => {
                            const buffer = event.target.result;
                            let fileName;
                            if (disableMp3Encoding) {
                                // Upload the custom format
                                fileName = encodeURIComponent('audio_' + new Date().getTime() + fileExtension);
                                this._recorded.next({ blob: this.recorder.blob, title: fileName });
                            } else {
                                // Upload the .mp3 format
                                fileName = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
                                this._recorded.next({ blob: this.encodeMP3(buffer), title: fileName });
                            }
                            this.stopMedia();
                        };
                        reader.readAsArrayBuffer(blob);
                    }
                },
                () => {
                    this.stopMedia();
                    this._recordingFailed.next();
                }
            );
        }
    }

    private encodeMP3(buffer) {
        const wav = lamejs.WavHeader.readHeader(new DataView(buffer));
        const left = new Int16Array(buffer, wav.dataOffset, wav.dataLen / 2);
        const right = new Int16Array(buffer, wav.dataOffset, wav.dataLen / 2);
        let remaining = left.length;
        const maxSamples = 1152;
        const dataBuffer: Int8Array[] = [];
        const mp3encoder = new lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 320);
        for (let i = 0; remaining >= maxSamples; i += maxSamples) {
            const leftChunk = left.subarray(i, i + maxSamples);
            const rightChunk = right.subarray(i, i + maxSamples);
            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                dataBuffer.push(new Int8Array(mp3buf));
            }
            remaining -= maxSamples;
        }
        const buf = mp3encoder.flush();
        if (buf.length) {
            dataBuffer.push(new Int8Array(buf));
        }
        const mp3Blob = new Blob(dataBuffer, { type: 'audio/mpeg' });
        return mp3Blob;
    }

    private stopMedia() {
        if (this.recorder) {
            this.recorder = null;
            clearInterval(this.interval);
            this.startTime = null;
            if (this.stream) {
                this.stream.getAudioTracks().forEach((track) => track.stop());
                this.stream = null;
            }
        }
    }
}
