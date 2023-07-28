import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'getHashCode' })
export class GetHashCodePipe implements PipeTransform {
    transform(str: string): string {
        if (str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                // tslint:disable-next-line:no-bitwise
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            let colour = '#';
            for (let i = 0; i < 3; i++) {
                // tslint:disable-next-line:no-bitwise
                const value = (hash >> (i * 8)) & 0xff;
                colour += ('00' + value.toString(16)).substr(-2);
            }
            return colour;
        }

        return '#FFFFFF';
    }
}

@NgModule({
    imports: [],
    declarations: [GetHashCodePipe],
    exports: [GetHashCodePipe],
})
export class PipesGetHashCodePipeModule {
    public static forRoot(): ModuleWithProviders<PipesGetHashCodePipeModule> {
        return {
            ngModule: PipesGetHashCodePipeModule,
            providers: [GetHashCodePipe],
        };
    }
}
