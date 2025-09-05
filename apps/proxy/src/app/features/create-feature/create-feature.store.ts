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
                        (res: BaseResponse<IMethod[], void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                            }
                            return this.patchState({
                                isLoading: false,
                                serviceMethods: res?.data ?? null,
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

    private showError(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
