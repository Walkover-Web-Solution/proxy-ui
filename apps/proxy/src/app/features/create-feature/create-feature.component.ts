import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { Observable } from 'rxjs';
import { FeatureComponentStore } from './create-feature.store';
import { IFeatureType } from '@proxy/models/features-model';

@Component({
    selector: 'proxy-create-feature',
    templateUrl: './create-feature.component.html',
    styleUrls: ['./create-feature.component.scss'],
    providers: [FeatureComponentStore],
})
export class CreateFeatureComponent extends BaseComponent implements OnDestroy, OnInit {
    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public featureType$: Observable<IFeatureType[]> = this.componentStore.featureType$;

    constructor(private componentStore: FeatureComponentStore) {
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
