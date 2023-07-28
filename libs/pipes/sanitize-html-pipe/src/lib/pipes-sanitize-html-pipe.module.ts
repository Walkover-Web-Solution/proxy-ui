import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'sanitizeHtml',
})
export class SanitizeHtmlPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(value: any): SafeHtml {
        const v = value?.replace(/<a/gi, function (matched) {
            return '<a target="_blank"';
        });
        return this.sanitizer.bypassSecurityTrustHtml(v);
    }
}

@NgModule({
    declarations: [SanitizeHtmlPipe],
    exports: [SanitizeHtmlPipe],
})
export class PipesSanitizeHtmlPipeModule {
    public static forRoot(): ModuleWithProviders<PipesSanitizeHtmlPipeModule> {
        return {
            ngModule: PipesSanitizeHtmlPipeModule,
            providers: [SanitizeHtmlPipe],
        };
    }
}
