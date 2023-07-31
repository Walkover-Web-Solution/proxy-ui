import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { LogInEffects } from './login.effects';

@NgModule({
    imports: [EffectsModule.forFeature([LogInEffects])],
    exports: [EffectsModule],
})
export class LogInEffectsModule {
    public static forFeature(): ModuleWithProviders<LogInEffectsModule> {
        return {
            ngModule: LogInEffectsModule,
            providers: [],
        };
    }
}
