import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule],
})
export class ServiceModule {
    public static forRoot(): ModuleWithProviders<ServiceModule> {
        return {
            ngModule: ServiceModule,
            providers: [],
        };
    }
}
