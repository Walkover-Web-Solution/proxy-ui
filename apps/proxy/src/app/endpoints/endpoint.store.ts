import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { BaseComponent } from '@proxy/ui/base-component';

@Injectable()
export class EndpointComponentStore extends ComponentStore<any> {
    constructor() {
        super();
    }
}
