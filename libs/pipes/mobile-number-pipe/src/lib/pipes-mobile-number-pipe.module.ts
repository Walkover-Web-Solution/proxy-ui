import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mobileNumber' })
export class MobileNumberPipe implements PipeTransform {
    transform(value: string): string {
        return value.replace(value.substr(2, 6), '######');
    }
}

@NgModule({
    imports: [],
    declarations: [MobileNumberPipe],
    exports: [MobileNumberPipe],
})
export class PipesMobileNumberPipeModule {
    public static forRoot(): ModuleWithProviders<PipesMobileNumberPipeModule> {
        return {
            ngModule: PipesMobileNumberPipeModule,
            providers: [MobileNumberPipe],
        };
    }
}
