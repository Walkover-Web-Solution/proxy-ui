import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PlayerComponent } from '@proxy/ui/player';
import { Observable } from 'rxjs';

@Component({
    selector: 'proxy-tts-recording',
    templateUrl: './tts-recording.component.html',
    styleUrls: ['./tts-recording.component.scss'],
})
export class TtsRecordingComponent {
    /** Stores the accent dropdown options */
    public accents = {
        Arabic: 'ar',
        Bengali: 'bn',
        German: 'de',
        'English (India)': 'en-in',
        'English (UK)': 'en-uk',
        'English (US)': 'en-us',
        English: 'en',
        'Spanish (Spain)': 'es-es',
        French: 'fr',
        Hindi: 'hi',
        Indonesian: 'id',
        Italian: 'it',
        Japanese: 'ja',
        Korean: 'ko',
        Latin: 'la',
        Malayalam: 'ml',
        Marathi: 'mr',
        'Myanmar (Burmese)': 'my',
        Nepali: 'ne',
        Russian: 'ru',
        Tamil: 'ta',
        Telugu: 'te',
        Thai: 'th',
    };

    /** Buffer function for API call */
    @Input() getBufferFunc: (args: any) => Blob | Observable<Blob>;
    /** Stores the current status of TTS upload progress */
    @Input() public isTTSUploadFileInProgress: boolean;
    /** Stores the TTS configuration object */
    @Input() public ttsObj: any = {
        accent: 'hindi',
    };

    /** Save TTS event */
    @Output() ttsSave: EventEmitter<void> = new EventEmitter();

    /** Stores the instance of audio player */
    @ViewChild('audio', { static: true }) public audio: PlayerComponent;

    /**
     * Prepares the request object for TTS recording
     *
     * @memberof TtsRecordingComponent
     */
    getBuffer = () => {
        let textToConvert = this.ttsObj.textToConvert;
        if (textToConvert) {
            let match;
            const regex = /#(\d+)#/gm;
            while ((match = regex.exec(textToConvert))) {
                textToConvert = textToConvert.replace(match[0], `<say-as interpret-as='digits'>${match[1]}</say-as>`);
            }
        }
        return this.getBufferFunc({ ...this.ttsObj, textToConvert });
    };

    /**
     * Deletes the uploaded file
     *
     * @param {boolean} [clear] True, if text needs to be clear along with audio
     * @memberof TtsRecordingComponent
     */
    deleteAudioFile(clear?: boolean) {
        if (this.audio) {
            this.audio.clearAudio();
        }
        if (clear) {
            this.ttsObj = { ...this.ttsObj, textToConvert: '' };
        }
    }

    /**
     * Save TTS handler
     *
     * @memberof TtsRecordingComponent
     */
    saveTts() {
        this.isTTSUploadFileInProgress = true;
        let textToConvert = this.ttsObj.textToConvert;
        if (textToConvert) {
            let match;
            const regex = /#(\d+)#/gm;
            while ((match = regex.exec(textToConvert))) {
                textToConvert = textToConvert.replace(match[0], `<say-as interpret-as='digits'>${match[1]}</say-as>`);
            }
        }
        this.ttsSave.emit({ ...this.ttsObj, textToConvert });
    }
}
