import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { ALPHANUMERIC_WITH_SPACE_REGEX } from '@proxy/regex';

@Pipe({ name: 'getShortName' })
export class GetShortNamePipe implements PipeTransform {
    transform(fullName: string, returnBackgroundColor: boolean = false): string {
        if (!new RegExp(ALPHANUMERIC_WITH_SPACE_REGEX).test(fullName)) {
            if (!returnBackgroundColor) {
                return 'AC';
            } else {
                return '#f3f3f3';
            }
        }
        if (fullName) {
            const initials = fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2);
            if (returnBackgroundColor) {
                let newInit = fullName
                    .split(' ')
                    .map((n) => n[2])
                    .join('')
                    .substring(0, 2);
                return `#${(((newInit.charCodeAt(0) + newInit.charCodeAt(1)) * 0xabcdef) << 0)
                    .toString(16)
                    .substring(1, 7)}50`;
            }
            return initials;
        }
        return fullName;
    }
}

@NgModule({
    imports: [],
    declarations: [GetShortNamePipe],
    exports: [GetShortNamePipe],
})
export class PipesGetShortNamePipeModule {
    public static forRoot(): ModuleWithProviders<PipesGetShortNamePipeModule> {
        return {
            ngModule: PipesGetShortNamePipeModule,
            providers: [GetShortNamePipe],
        };
    }
}
