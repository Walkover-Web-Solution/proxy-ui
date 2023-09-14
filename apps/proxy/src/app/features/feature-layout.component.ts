import { Component } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    selector: 'proxy-features',
    template: `<router-outlet></router-outlet>`,
})
export class FeaturesLayoutComponent extends BaseComponent {}
