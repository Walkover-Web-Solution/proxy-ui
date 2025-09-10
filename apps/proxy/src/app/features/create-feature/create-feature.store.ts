import { Injectable } from '@angular/core';
import { BaseResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { IFeature, IFeatureDetails, IFeatureType, IMethod } from '@proxy/models/features-model';
import { FeaturesService } from '@proxy/services/proxy/features';
export interface ICreateFeatureInitialState {
    featureType: IFeatureType[];
    isLoading: boolean;
    serviceMethods: IMethod[];
    createUpdateObject: IFeature;
    featureDetails: IFeatureDetails;
    lagoFeature: any;
    billableMetrics: any;
    createBillableMetric: any;
    updateBillableMetric: any;
    billableMetricForm: any;
    plansForm: any;
    taxes: any;
}

@Injectable()
export class CreateFeatureComponentStore extends ComponentStore<ICreateFeatureInitialState> {
    constructor(private service: FeaturesService, private toast: PrimeNgToastService) {
        super({
            featureType: null,
            isLoading: false,
            serviceMethods: null,
            createUpdateObject: null,
            featureDetails: null,
            lagoFeature: null,
            billableMetrics: null,
            createBillableMetric: null,
            updateBillableMetric: null,
            billableMetricForm: null,
            plansForm: null,
            taxes: null,
        });
    }
    /** Selector for API progress  */
    readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);
    /** Selector for feature type data */
    readonly featureType$: Observable<IFeatureType[]> = this.select((state) => state.featureType);
    /** Selector for service method data */
    readonly serviceMethods$: Observable<IMethod[]> = this.select((state) => state.serviceMethods);
    /** Selector for object we get after create or update success */
    readonly createUpdateObject$: Observable<IFeature> = this.select((state) => state.createUpdateObject);
    /** Selector for Feature Details*/
    readonly featureDetails$: Observable<IFeatureDetails> = this.select((state) => state.featureDetails);
    /** Selector for lago feature data */
    readonly lagoFeature$: Observable<any> = this.select((state) => state.lagoFeature);
    /** Selector for billable metrics data */
    readonly billableMetrics$: Observable<any> = this.select((state) => state.billableMetrics);
    /** Selector for create billable metric data */
    readonly createBillableMetric$: Observable<any> = this.select((state) => state.createBillableMetric);
    /** Selector for update billable metric data */
    readonly updateBillableMetric$: Observable<any> = this.select((state) => state.updateBillableMetric);
    /** Selector for billable metric form data */
    readonly billableMetricForm$: Observable<any> = this.select((state) => state.billableMetricForm);
    /** Selector for plans form data */
    readonly plansForm$: Observable<any> = this.select((state) => state.plansForm);

    public dummyData = {
        'data': [
            {
                'id': 4,
                'name': 'Subscription',
                'service_use': 'multiple',
                'icon': 'none',
                'method_services': [
                    {
                        'name': 'Lago Billing',
                        'method_id': 4,
                        'service_id': 10,
                        'configurations': {
                            'fields': {
                                'legal_name': {
                                    'is_required': true,
                                    'is_hidden': false,
                                    'label': 'Legal Name',
                                    'value_type': 'string',
                                    'type': 'text',
                                    'regex': '^.{1,255}$',
                                    'source': '',
                                    'sourceFieldLabel': 'name',
                                    'sourceFieldValue': 'name',
                                    'value': '',
                                    'allowed_types': null,
                                    'fileName': null,
                                },
                                'legal_number': {
                                    'is_required': false,
                                    'is_hidden': false,
                                    'label': 'Legal Number',
                                    'value_type': 'string',
                                    'type': 'text',
                                    'regex': '^.{0,255}$',
                                    'source': '',
                                    'sourceFieldLabel': 'name',
                                    'sourceFieldValue': 'name',
                                    'value': '',
                                    'allowed_types': null,
                                    'fileName': null,
                                },
                                'tax_identification_number': {
                                    'is_required': false,
                                    'is_hidden': false,
                                    'label': 'Tax Identification Number',
                                    'value_type': 'string',
                                    'type': 'text',
                                    'regex': '^.{0,255}$',
                                    'source': '',
                                    'sourceFieldLabel': 'name',
                                    'sourceFieldValue': 'name',
                                    'value': '',
                                    'allowed_types': null,
                                    'fileName': null,
                                },
                                'email': {
                                    'is_required': true,
                                    'is_hidden': false,
                                    'label': 'Email',
                                    'value_type': 'email',
                                    'type': 'text',
                                    'regex': '^[\\w.%+-]+@[\\w.-]+\\.[A-Za-z]{2,}$',
                                    'source': '',
                                    'sourceFieldLabel': 'name',
                                    'sourceFieldValue': 'name',
                                    'value': '',
                                    'allowed_types': null,
                                    'fileName': null,
                                },
                                'address_line1': {
                                    'is_required': false,
                                    'is_hidden': false,
                                    'label': 'Address Line 1',
                                    'value_type': 'string',
                                    'type': 'text',
                                    'regex': '^.{0,255}$',
                                    'source': '',
                                    'sourceFieldLabel': 'name',
                                    'sourceFieldValue': 'name',
                                    'value': '',
                                    'allowed_types': null,
                                    'fileName': null,
                                },
                                'address_line2': {
                                    'is_required': false,
                                    'is_hidden': false,
                                    'label': 'Address Line 2',
                                    'value_type': 'string',
                                    'type': 'text',
                                    'regex': '^.{0,255}$',
                                    'source': '',
                                    'sourceFieldLabel': 'name',
                                    'sourceFieldValue': 'name',
                                    'value': '',
                                    'allowed_types': null,
                                    'fileName': null,
                                },
                                'postal_code': {
                                    'is_required': false,
                                    'is_hidden': false,
                                    'label': 'Postal Code',
                                    'value_type': 'string',
                                    'type': 'text',
                                    'regex': '^[A-Za-z0-9\\s-]{0,10}$',
                                    'source': '',
                                    'sourceFieldLabel': 'name',
                                    'sourceFieldValue': 'name',
                                    'value': '',
                                    'allowed_types': null,
                                    'fileName': null,
                                },
                                'city': {
                                    'is_required': false,
                                    'is_hidden': false,
                                    'label': 'City',
                                    'value_type': 'string',
                                    'type': 'text',
                                    'regex': '^[a-zA-Z\\s]{0,50}$',
                                    'source': '',
                                    'sourceFieldLabel': 'name',
                                    'sourceFieldValue': 'name',
                                    'value': '',
                                    'allowed_types': null,
                                    'fileName': null,
                                },
                                'state': {
                                    'is_required': false,
                                    'is_hidden': false,
                                    'label': 'State',
                                    'value_type': 'string',
                                    'type': 'text',
                                    'regex': '^[a-zA-Z\\s]{0,50}$',
                                    'source': '',
                                    'sourceFieldLabel': 'name',
                                    'sourceFieldValue': 'name',
                                    'value': '',
                                    'allowed_types': null,
                                    'fileName': null,
                                },
                                'country': {
                                    'is_required': false,
                                    'is_hidden': false,
                                    'label': 'Country',
                                    'value_type': 'string',
                                    'type': 'select',
                                    'regex': '^[A-Z]{2}$',
                                    'source': '/api/countries',
                                    'sourceFieldLabel': 'name',
                                    'sourceFieldValue': 'code',
                                    'value': '',
                                    'allowed_types': null,
                                    'fileName': null,
                                },
                            },
                            'mappings': [],
                        },
                        'requirements': {},
                    },
                ],
                'authorization_format': {
                    'format': {
                        'company': {
                            'id': "_COMPANY['id']",
                            'name': "_COMPANY['name']",
                            'email': "_COMPANY['email']",
                            'mobile': "_COMPANY['mobile']",
                            'timezone': "_COMPANY['timezone']",
                        },
                        'user': {
                            'id': "_USER['id']",
                            'name': "_USER['name']",
                            'email': "_USER['email']",
                            'mobile': "_USER['mobile']",
                        },
                        'ip': '_IP',
                    },
                    'encode_type': 'JWT',
                    'key': 'Authorization',
                },
            },
        ],
        'status': 'success',
        'hasError': false,
        'errors': [],
        'proxy_duration': 44,
    };

    /** Get feature type data */
    readonly getFeatureType = this.effect((data) => {
        return data.pipe(
            switchMap(() => {
                this.patchState({ isLoading: true });
                return this.service.getFeatureType().pipe(
                    tapResponse(
                        (res: BaseResponse<IFeatureType[], void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                            }
                            return this.patchState({
                                isLoading: false,
                                featureType: res?.data ?? null,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false, featureType: null });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    /** Get service method data */
    readonly getServiceMethods = this.effect((data: Observable<number>) => {
        return data.pipe(
            switchMap((req: number) => {
                this.patchState({ isLoading: true });
                return this.service.getMethodService(req).pipe(
                    tapResponse(
                        (res: BaseResponse<any[], void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                            }
                            return this.patchState({
                                isLoading: false,
                                serviceMethods: this.dummyData.data ?? null,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({
                                isLoading: false,
                                serviceMethods: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly createFeature = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.createFeature(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IFeature, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('Feature created successfully');
                            return this.patchState({
                                isLoading: false,
                                createUpdateObject: res.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly updateFeature = this.effect((data: Observable<{ id: string | number; body: { [key: string]: any } }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.updateFeature(req.id, req.body).pipe(
                    tapResponse(
                        (res: BaseResponse<IFeature, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('Feature updated successfully');
                            return this.patchState({
                                isLoading: false,
                                createUpdateObject: res.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    /** Get Feature Details */
    readonly getFeatureDetalis = this.effect((data: Observable<number>) => {
        return data.pipe(
            switchMap((id) => {
                this.patchState({ isLoading: true });
                return this.service.getFeatureDetails(id).pipe(
                    tapResponse(
                        (res: BaseResponse<IFeatureDetails, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                            }
                            return this.patchState({
                                isLoading: false,
                                featureDetails: res?.data ?? null,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false, featureDetails: null });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly createLagoFeature = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.createLagoFeature(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IFeature, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('Lago feature created successfully');
                            return this.patchState({
                                isLoading: false,
                                lagoFeature: res.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    )
                );
            })
        );
    });

    readonly getAllBillableMetrics = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.getAllBillableMetrics(req.refId).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            return this.patchState({
                                isLoading: false,
                                billableMetrics: res.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    )
                );
            })
        );
    });

    readonly createBillableMetric = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.createBillableMetric(req.body).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('Billable metric created successfully');
                            return this.patchState({
                                isLoading: false,
                                createBillableMetric: res.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly updateBillableMetric = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.updateBillableMetric(req.refId, req.body).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('Billable metric updated successfully');
                            return this.patchState({
                                isLoading: false,
                                createBillableMetric: res.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly getBillableMetricForm = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.getBillableMetricForm().pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            return this.patchState({ isLoading: false, billableMetricForm: res.data });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly getPlansForm = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.getPlansForm(req.refId).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            return this.patchState({ isLoading: false, plansForm: res.data });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly getTaxes = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.getTaxes(req.refId).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            return this.patchState({ isLoading: false, taxes: res.data });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    private showError(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
