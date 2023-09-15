import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { Observable } from 'rxjs';
import { CreateFeatureComponentStore } from './create-feature.store';
import { IFeatureType } from '@proxy/models/features-model';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

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
            name: new FormControl<string>(null),
            feature_id: new FormControl<number>(null),
            method_id: new FormControl<number>(null),
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
