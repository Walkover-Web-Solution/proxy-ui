import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'FileName' })
export class FileNamePipe implements PipeTransform {
    transform(value: string): string {
        let regex = new RegExp(
            '^(https?:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$',
            'i'
        );
        if (value && regex.test(value)) {
            return value
                .substr(value.lastIndexOf('/') + 1)
                .split('-')
                .slice(1)
                .join('');
        }
        return '';
    }
}

@NgModule({
    imports: [],
    declarations: [FileNamePipe],
    exports: [FileNamePipe],
})
export class PipesFileNamePipeModule {
    public static forRoot(): ModuleWithProviders<PipesFileNamePipeModule> {
        return {
            ngModule: PipesFileNamePipeModule,
            providers: [FileNamePipe],
        };
    }
}
