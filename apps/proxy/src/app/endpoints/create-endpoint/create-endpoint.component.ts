import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'proxy-create-endpoint',
    templateUrl: './create-endpoint.component.html',
    styleUrls: ['./create-endpoint.component.scss'],
})
export class CreateEndpointComponent implements OnInit {
    public methodTypes = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    public verificationMethod = ['define new method', 'Campaign Validate Api', 'CampainDB', 'campain FireBase'];
    public selectedValue: String;
    public endpointForm = new FormGroup({
        endpoint: new FormControl<string>(null, [Validators.required]),
    });
    constructor() {}

    ngOnInit(): void {}
}
