import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'maskString',
})
export class StringMaskingPipe implements PipeTransform {
    transform(str: string, fromFirst: number, fromLast: number): string {
        return str.slice(0, fromFirst) + '*'.repeat(str.length - fromFirst - fromLast) + str.slice(-fromLast);
    }
}

@NgModule({
    declarations: [StringMaskingPipe],
    exports: [StringMaskingPipe],
})
export class PipesStringMaskingModule {
    public static forRoot(): ModuleWithProviders<PipesStringMaskingModule> {
        return {
            ngModule: PipesStringMaskingModule,
            providers: [StringMaskingPipe],
        };
    }
}
