import { FormArray, FormControl } from '@angular/forms';

export interface IPrimaryDetailsForm {
    name: FormControl<string | null>;
    rateLimitHit: FormControl<number | null>;
    rateLimitMinite: FormControl<number | null>;
    selectedEnvironments: FormControl<string[] | null>;
}
export interface IGatewayUrlDetailsForm {
    useSameUrlForAll?: FormControl<boolean>;
    gatewayUrls: FormArray<FormControl<string>>;
    singleUrl?: FormControl<string>;
}

export interface IDestinationUrlForm {
    endpoint: FormControl<string>;

    ForwardUrl: FormArray<FormControl<string>>;
}
export interface IFormArray<T> extends FormArray {
    controls: FormControl<T>[];
}
export interface ISourceItem {
    source: string;
}
export interface ICreateSource {
    data: ISourceItem[];
}
