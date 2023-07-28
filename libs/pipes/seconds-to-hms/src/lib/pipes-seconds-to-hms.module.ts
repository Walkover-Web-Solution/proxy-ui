import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'secondsToHMS',
})
export class SecondsToHMSPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(value: any, separator: string = ', ', withDay: boolean = false): SafeHtml | string {
        if (value) {
            value = Number(value);
            const h = Math.floor((value % (24 * 3600)) / 3600);
            const m = Math.floor(((value % (24 * 3600)) % 3600) / 60);
            const s = Math.floor(((value % (24 * 3600)) % 3600) % 60);

            const hh = h > 0 ? `${h} hr${m || s ? separator : ''}` : '';
            const mm = m > 0 ? `${m} min${s ? separator : ''}` : '';
            const ss = s > 0 ? `${s} sec` : '';

            if (separator === 'HH:MM:SS') {
                return `${h.toString().padStart(2, '0') ?? '00'}:${m.toString().padStart(2, '0') ?? '00'}:${
                    s.toString().padStart(2, '0') ?? '00'
                }`;
            }

            if (withDay) {
                let str = '';
                const days = Math.floor(value / (24 * 3600));
                if (days > 0) str += days + ` days${separator}`;
                if (hh.length) str += hh;
                if (mm.length) str += mm;
                if (ss.length) str += ss;

                return str[str.length - 1] === ' ' ? str.slice(0, str.length - 2) : str;
            }

            return hh + mm + ss;
        } else {
            return `0 sec`;
        }
    }
}

@NgModule({
    declarations: [SecondsToHMSPipe],
    exports: [SecondsToHMSPipe],
})
export class PipesSecondsToHmsPipeModule {
    public static forRoot(): ModuleWithProviders<PipesSecondsToHmsPipeModule> {
        return {
            ngModule: PipesSecondsToHmsPipeModule,
            providers: [SecondsToHMSPipe],
        };
    }
}
