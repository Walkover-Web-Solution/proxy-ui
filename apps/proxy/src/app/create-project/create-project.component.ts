import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, FormBuilder } from '@angular/forms';
import { CAMPAIGN_NAME_REGEX, ONLY_INTEGER_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { environment } from '../../environments/environment';

import { FeaturesService } from '@proxy/services/proxy/features';

@Component({
    selector: 'proxy-create-project',
    templateUrl: './create-project.component.html',
    styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit {
    public projectForm: FormGroup;
    public primaryDetails;
    public checked: false;

    public baseurl = `${environment.baseUrl}/proxy/{companyid}/{projectslug}`;
    public apiUrl = `${environment.baseUrl}/projects`;

    constructor(private services: FeaturesService) {
        this.projectForm = new FormGroup({
            primaryDetails: new FormGroup({
                name: new FormControl<string>('', [
                    Validators.required,
                    Validators.pattern(CAMPAIGN_NAME_REGEX),
                    CustomValidators.minLengthThreeWithoutSpace,
                    CustomValidators.noStartEndSpaces,
                    Validators.maxLength(60),
                ]),
                environments: new FormControl([], Validators.required),

                rateLimit_hit: new FormControl<number>(null, [
                    Validators.required,
                    Validators.pattern(ONLY_INTEGER_REGEX),
                ]),
                rateLimit_minute: new FormControl<number>(null, [Validators.required]),
            }),

            gatewayUrlDetails: new FormGroup({
                devUrl: new FormControl<string>(null, Validators.required),
                prodUrl: new FormControl<string>(null, Validators.required),
            }),

            destinationUrl: new FormGroup({
                uniqueIdentifiCation: new FormControl<string>(null, Validators.required),
                devForward: new FormControl<string>(null, Validators.required),
                prodForward: new FormControl<string>(null, Validators.required),
            }),
        });
    }

    ngOnInit(): void {}

    onChange(event) {
        this.checked = event.checked;
    }

    public onSubmit(): void {
        const { name, environments, rateLimit_hit, rateLimit_minute } = this.projectForm.get('primaryDetails').value;
        const projectDetails = {
            'name': name,
            'environments': {
                [environments[0]]: {
                    'rate_limiter': `${rateLimit_hit}:${rateLimit_minute}`,
                },
                [environments[1]]: {
                    'rate_limiter': `${rateLimit_hit}:${rateLimit_minute}`,
                },
            },
        };
        this.services.createproject(projectDetails).subscribe(
            (response) => {},
            (error) => {}
        );
        console.log(projectDetails);
    }
}
