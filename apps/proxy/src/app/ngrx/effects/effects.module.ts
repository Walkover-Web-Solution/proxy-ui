import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { RootEffects } from './root';

@NgModule({
    imports: [CommonModule, EffectsModule.forRoot([RootEffects])],
    exports: [EffectsModule],
})
export class EffectModule {
    public static forRoot(): ModuleWithProviders<EffectModule> {
        return {
            ngModule: EffectModule,
            providers: [],
        };
    }
}
