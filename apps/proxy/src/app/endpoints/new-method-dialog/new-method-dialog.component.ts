import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IFirebaseUserModel } from '@proxy/models/root-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { combineLatest, distinctUntilChanged, Observable, takeUntil } from 'rxjs';
import { ILogInFeatureStateWithRootState } from '../../auth/ngrx/store/login.state';
import { select, Store } from '@ngrx/store';
import { RootService } from '@proxy/services/proxy/root';
import { selectLogInData } from '../../auth/ngrx/selector/login.selector';
import { isEqual } from 'lodash';
import { environment } from 'apps/proxy/src/environments/environment';
import { NewMethodDialogComponentStore } from './new-method-dialog.store';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'new-method-dialog',
    templateUrl: './new-method-dialog.component.html',
    styleUrls: ['./new-method-dialog.component.scss'],
    providers: [NewMethodDialogComponentStore],
})
export class NewMethodDialogComponent extends BaseComponent implements OnInit {
    public dialogStep = 0;
    public showPage: string;
    public projectSlug: string;
    public requestTypes: Array<string> = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    public keyLocation: Array<string> = ['Header', 'Cookies'];
    public veriFicationMethod: Array<string> = ['Api', 'Mysql DB', 'FireBase'];
    public logInData$: Observable<IFirebaseUserModel>;
    public defineMethodForm = new FormGroup({
        methodVerfication: new FormControl<string>(null, Validators.required),
        policyName: new FormControl<string>(null, Validators.required),
        authorizationKey: new FormControl<string>(null, Validators.required),
        inboundKeyLocation: new FormControl<string>(null),
        requestType: new FormControl<string>(null, Validators.required),
        verificationUrl: new FormControl<string>(null, Validators.required),
        authKey: new FormControl<string>(null, Validators.required),
        verficationKeyLocation: new FormControl<string>(null),
        responseAuthorizationKey: new FormControl<string>(null, Validators.required),
        keyType: new FormControl<string>(null, Validators.required),
    });
    constructor(
        public dialogRef: MatDialogRef<NewMethodDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private store: Store<ILogInFeatureStateWithRootState>,
        private rootService: RootService,
        private ComponentStore: NewMethodDialogComponentStore,
        private activatedRoute: ActivatedRoute
    ) {
        super();
        this.showPage = data.value.type;
        this.projectSlug = data.value.projectSlug;
        this.logInData$ = this.store.pipe(
            select(selectLogInData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }
    ngOnInit(): void {
        this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            if (params?.projectSlug) {
                this.projectSlug = params.projectSlug;
            }
        });

        if (this.showPage === 'viasocket') {
            combineLatest([this.logInData$]).subscribe(([loginData]) => {
                if (loginData) {
                    this.rootService.generateToken({ source: 'configViaSocket' }).subscribe((res) => {
                        const scriptId = 'viasocket-embed-main-script';
                        const existingScript = document.getElementById(scriptId);
                        if (existingScript) {
                            existingScript.remove();
                        }
                        const scriptElement = document.createElement('script');
                        scriptElement.type = 'text/javascript';
                        scriptElement.src = environment.viasocketEmbededURl;
                        scriptElement.id = scriptId;
                        scriptElement.setAttribute('embedToken', res?.data?.jwt);
                        scriptElement.setAttribute('parentId', 'viasocket-embed-Container');
                        scriptElement.onload = () => {};

                        document.body.appendChild(scriptElement);
                    });
                }
            });
        }
    }
    public closeDialog(): void {
        this.dialogRef.close();
    }
    onSelectionChange(event: any) {
        const selectedValue = event.value;
        if (selectedValue === 'Api') {
            this.dialogStep = 1;
        } else if (selectedValue === 'Mysql DB') {
            this.dialogStep = 2;
        } else {
            this.dialogStep = 0;
        }
    }
    onsave() {
        const formData = this.defineMethodForm.value;
        const payload = {
            configuration_id: 3,
            slug: this.projectSlug,
            configurations: {
                fields: {
                    inbound_key: {
                        value: formData.authorizationKey,
                    },
                    inbound_key_input_location: {
                        value: formData.inboundKeyLocation,
                    },
                    outbound_key: {
                        value: formData.responseAuthorizationKey,
                    },
                    outbound_value_type: {
                        value: formData.keyType,
                    },
                    verify_key: {
                        value: formData.authKey,
                    },
                    verify_key_input_location: {
                        value: formData.verficationKeyLocation,
                    },
                },
            },
            requirements: {
                endpoint: {
                    value: formData.verificationUrl,
                },
                method: {
                    value: formData.requestType,
                },
            },
        };
        this.ComponentStore.verficationIntegration(payload);
    }
}
