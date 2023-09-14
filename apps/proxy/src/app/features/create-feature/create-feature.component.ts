import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    selector: 'proxy-create-feature',
    templateUrl: './create-feature.component.html',
    styleUrls: ['./create-feature.component.scss'],
})
export class CreateFeatureComponent extends BaseComponent implements OnDestroy, OnInit {
    constructor() {
        super();
    }

    ngOnInit(): void {
        console.log('Hello');
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
