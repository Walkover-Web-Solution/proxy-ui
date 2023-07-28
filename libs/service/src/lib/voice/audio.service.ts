import { Inject, Injectable } from '@angular/core';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { URLS } from './models/api-urls';
import { VoiceLibServiceModule } from './voice.module';
import { AudioFile } from '@msg91/models/voice-models';

@Injectable({
    providedIn: VoiceLibServiceModule,
})
export class AudioService {
    url: string;

    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.VoiceBaseURL) private baseUrl: any) {}

    public getAllAudio(): Observable<BaseResponse<{ data: AudioFile[] }, void>> {
        return this.http.get<BaseResponse<{ data: AudioFile[] }, void>>(`${this.baseUrl}${URLS.AUDIO.GET}`);
    }

    public phoneRecord(data): Observable<any> {
        return this.http.post(`${this.baseUrl}${URLS.AUDIO.PHONE_RECORD}`, data);
    }

    public getAudio(id: number): Observable<any> {
        // @ts-ignore
        return this.http
            .get(`${this.baseUrl}${URLS.AUDIO.GET}${id}`, { responseType: 'blob' })
            .pipe(map((res) => new Blob([res], { type: 'audio/mpeg' })));
    }

    public uploadAudio(file: File | Blob, name?: string): Observable<any> {
        const data = new FormData();
        // @ts-ignore
        data.append('file', file, file.name || name);
        return this.http.post(`${this.baseUrl}${URLS.AUDIO.UPLOAD}`, data);
    }

    public saveTts(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}${URLS.AUDIO.GET}`, data);
    }

    public previewTts(data: { textToConvert; accent }): Observable<any> {
        // @ts-ignore
        return this.http.post(`${this.baseUrl}${URLS.AUDIO.PREVIEW_TTS}`, data, { responseType: 'blob' });
    }

    public deleteAudio(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}${URLS.AUDIO.GET}${id}`);
    }
}
