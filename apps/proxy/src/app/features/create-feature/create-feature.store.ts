import { Injectable } from '@angular/core';
import { BaseResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { IFeature, IFeatureType, IMethod } from '@proxy/models/features-model';
import { FeaturesService } from '@proxy/services/proxy/features';
export interface ICreateFeatureInitialState {
    featureType: IFeatureType[];
    isLoading: boolean;
    serviceMethods: IMethod[];
    createUpdateObject: IFeature;
}

@Injectable()
export class CreateFeatureComponentStore extends ComponentStore<ICreateFeatureInitialState> {
    constructor(private service: FeaturesService, private toast: PrimeNgToastService) {
        super({
            featureType: null,
            isLoading: false,
            serviceMethods: null,
            createUpdateObject: null,
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
                                featureType: res.data,
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
                                serviceMethods: res?.data,
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
                            }
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
                            }
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

    private showError(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
