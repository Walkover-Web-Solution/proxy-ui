import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'userSetting' })
export class UserSettingPipe implements PipeTransform {
    transform(value: string): string {
        if (value === 'CALLBACK') {
            return value[0].toUpperCase() + value.substr(1, 3).toLowerCase() + ' ' + value.substr(4).toLowerCase();
        }
        return value[0].toUpperCase() + value.substr(1).toLowerCase();
    }
}

@NgModule({
    imports: [],
    declarations: [UserSettingPipe],
    exports: [UserSettingPipe],
})
export class PipesUserSettingPipeModule {
    public static forRoot(): ModuleWithProviders<PipesUserSettingPipeModule> {
        return {
            ngModule: PipesUserSettingPipeModule,
            providers: [UserSettingPipe],
        };
    }
}
