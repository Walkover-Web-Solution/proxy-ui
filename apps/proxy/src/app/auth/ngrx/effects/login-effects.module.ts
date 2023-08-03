import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { LogInEffects } from './login.effects';
import { ServicesLoginModule } from '@proxy/services/login';

@NgModule({
    imports: [EffectsModule.forFeature([LogInEffects]), ServicesLoginModule],
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
