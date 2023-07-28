import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Pipe({
    name: 'filterControl',
})
export class FilterControlPipe implements PipeTransform {
    /**
     * Transforms the form controllers and returns only the controllers that
     * satisfy search criteria
     *
     * @param {Array<UntypedFormGroup>} value Array of UntypedFormGroup controllers
     * @param {string} searchKey Key name with which searching is performed
     * @param {string} searchedValue Value to search for
     * @return {Array<UntypedFormGroup>}  {Array<UntypedFormGroup>} Only the controllers that specify the search criteria
     * @memberof FilterControlPipe
     */
    transform(value: Array<UntypedFormGroup>, searchKey: string, searchedValue: string): Array<UntypedFormGroup> {
        if (!searchedValue) {
            return value;
        }
        return value?.filter((val: UntypedFormGroup) => {
            if (val.controls[searchKey]?.value) {
                return val.controls[searchKey].value.toLowerCase()?.indexOf(searchedValue.toLowerCase()) > -1;
            } else {
                return false;
            }
        });
    }
}

@NgModule({
    imports: [],
    declarations: [FilterControlPipe],
    exports: [FilterControlPipe],
})
export class PipesFilterControlPipeModule {
    public static forRoot(): ModuleWithProviders<PipesFilterControlPipeModule> {
        return {
            ngModule: PipesFilterControlPipeModule,
            providers: [FilterControlPipe],
        };
    }
}
