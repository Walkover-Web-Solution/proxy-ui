import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, ValidatorFn, FormBuilder } from '@angular/forms';
import { CAMPAIGN_NAME_REGEX, ONLY_INTEGER_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

import { FeaturesService } from '@proxy/services/proxy/features';

@Component({
    selector: 'proxy-create-project',
    templateUrl: './create-project.component.html',
    styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit {
    public projectForm: FormGroup;
    public primaryDetails;

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
                urlControl: new FormControl(true),
                devUrl: new FormControl<string>(null, []),
                prodUrl: new FormControl<string>(null, []),
            }),

            destinationUrl: new FormGroup({
                uniqueIdentifiCation: new FormControl<string>(null, []),
                devForward: new FormControl<string>(null, []),
                prodForward: new FormControl<string>(null, []),
            }),
        });
    }

    ngOnInit(): void {}
    // primaryDetails = this.projectForm.get('primaryDetails').value;
    // arrayToKeyObject(arr: string[]): { [key: string]: any } {
    //     const obj: { [key: string]: any } = {};
    //     arr.forEach(key => {
    //         obj[key] = {
    //             ratelimit: rateLimit
    //         }; // Initial default value, adjust as needed
    //     });

    //     return obj;
    // }
    public submit(): void {
        const formData = this.projectForm.value;
        console.log(formData);
    }
    public onSubmit(): void {
        let { name, environments, rateLimit_hit, rateLimit_minute } = this.projectForm.get('primaryDetails').value;
        let projectDetails = {
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
            (response) => {
                console.log('Registration success');
            },
            (error) => {}
        );
        console.log(projectDetails);

        if (this.projectForm.valid) {
            const formData = this.projectForm.value;
        } else {
            this.projectForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
        }
    }
}
