import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'greet' })
export class GreetingPipe implements PipeTransform {
    transform(value: Date): string {
        if (value) {
            const hrs = value.getHours();
            if (hrs < 12) return 'Good Morning';
            else if (hrs >= 12 && hrs <= 17) return 'Good Afternoon';
            else if (hrs >= 17 && hrs <= 24) return 'Good Evening';
        }
    }
}

@NgModule({
    imports: [],
    declarations: [GreetingPipe],
    exports: [GreetingPipe],
})
export class PipesGreetingPipeModule {
    public static forRoot(): ModuleWithProviders<PipesGreetingPipeModule> {
        return {
            ngModule: PipesGreetingPipeModule,
            providers: [GreetingPipe],
        };
    }
}
