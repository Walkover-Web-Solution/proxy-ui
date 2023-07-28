import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'TooltipList' })
export class TooltipListPipe implements PipeTransform {
    transform(lines: string | object): string {
        let list = '';
        if (typeof lines === 'string') {
            lines.split(',').forEach((line) => {
                list += '• ' + line + '\n';
            });
        } else {
            for (let key in lines) {
                if (lines.hasOwnProperty(key)) {
                    list += '• ' + key + ': ' + lines[key] + '\n';
                }
            }
        }
        return list;
    }
}

@NgModule({
    imports: [],
    declarations: [TooltipListPipe],
    exports: [TooltipListPipe],
})
export class PipesTooltipListPipeModule {
    public static forRoot(): ModuleWithProviders<PipesTooltipListPipeModule> {
        return {
            ngModule: PipesTooltipListPipeModule,
            providers: [TooltipListPipe],
        };
    }
}
