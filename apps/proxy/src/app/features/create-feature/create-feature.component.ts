import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { Observable } from 'rxjs';
import { CreateFeatureComponentStore } from './create-feature.store';
import { IFeatureType } from '@proxy/models/features-model';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CAMPAIGN_NAME_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';

type ServiceFormGroup = FormGroup<{
    requirements: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    configurations: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
}>;

@Component({
    selector: 'proxy-create-feature',
    templateUrl: './create-feature.component.html',
    styleUrls: ['./create-feature.component.scss'],
    providers: [CreateFeatureComponentStore],
})
export class CreateFeatureComponent extends BaseComponent implements OnDestroy, OnInit {
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public featureType$: Observable<IFeatureType[]> = this.componentStore.featureType$;

    public featureForm = new FormGroup({
        primaryDetails: new FormGroup({
            name: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(CAMPAIGN_NAME_REGEX),
                CustomValidators.minLengthThreeWithoutSpace,
                Validators.maxLength(60),
            ]),
            feature_id: new FormControl<number>(null, [Validators.required]),
            method_id: new FormControl<number>(null, [Validators.required]),
        }),
        serviceDetails: new FormArray<ServiceFormGroup>([]),
    });

    constructor(private componentStore: CreateFeatureComponentStore) {
        super();
    }

    ngOnInit(): void {
        this.getFeatureType();
        this.componentStore.getServiceMethods(1);
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public getFeatureType() {
        this.componentStore.getFeatureType();
    }
}
