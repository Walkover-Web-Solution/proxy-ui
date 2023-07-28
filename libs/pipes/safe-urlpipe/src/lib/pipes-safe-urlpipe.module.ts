import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeURL' })
export class SafeURLPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}
    transform(url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}

@NgModule({
    declarations: [SafeURLPipe],
    exports: [SafeURLPipe],
})
export class PipesSafeUrlPipeModule {
    public static forRoot(): ModuleWithProviders<PipesSafeUrlPipeModule> {
        return {
            ngModule: PipesSafeUrlPipeModule,
            providers: [SafeURLPipe],
        };
    }
}
