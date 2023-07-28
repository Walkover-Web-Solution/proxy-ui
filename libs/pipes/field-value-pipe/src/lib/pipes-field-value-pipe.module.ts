import { ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';

type KeyValue = { [key: string]: any };
type ReturnValue = string | KeyValue;
type DataType = KeyValue | Array<KeyValue>;

@Pipe({ name: 'fieldValuePipe' })
export class FieldValuePipe implements PipeTransform {
    /**
     *
     * @param data array or object
     * @param keyToCheckInObject key to check in object from with in data
     * @param valueCompareWithKeyInData value to check is equal to keyToCheckInObject.
     * @param whichToTake which key value to return from object, it accept dot separated string ex: config.img.value
     * @returns string | { [key: string]: any }
     */
    transform(
        data: DataType,
        valueCompareWithKeyInData: string,
        whichToTake: string,
        keyToCheckInObject: string = 'value'
    ): ReturnValue {
        if (Array.isArray(data) && data.length && valueCompareWithKeyInData?.length) {
            const find = data.find((f) => f[keyToCheckInObject].toString() === valueCompareWithKeyInData);
            return this.getDeepObjValue(find, whichToTake);
        } else if (typeof data === 'object') {
            return this.getDeepObjValue(data, whichToTake);
        }
        return '';
    }

    private getDeepObjValue(item: { [key: string]: any }, s: string) {
        return s.split('.').reduce((p, c) => {
            p = p[c];
            return p;
        }, item);
    }
}

@NgModule({
    declarations: [FieldValuePipe],
    exports: [FieldValuePipe],
})
export class PipesFieldValuePipeModule {
    public static forRoot(): ModuleWithProviders<PipesFieldValuePipeModule> {
        return {
            ngModule: PipesFieldValuePipeModule,
            providers: [FieldValuePipe],
        };
    }
}
