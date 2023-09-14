import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { IFeatureType, IMethod } from '@proxy/models/features-model';
import { FeaturesService } from '@proxy/services/proxy/features';

export interface IFeatureInitialState {
    featureType: IFeatureType[];
    isLoading: boolean;
    serviceMethods: IMethod[];
}

@Injectable()
export class FeatureComponentStore extends ComponentStore<IFeatureInitialState> {
    constructor(private service: FeaturesService, private toast: PrimeNgToastService) {
        super({
            featureType: null,
            isLoading: false,
            serviceMethods: null,
        });
    }

    readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);
    readonly featureType$: Observable<IFeatureType[]> = this.select((state) => state.featureType);
    readonly serviceMthods$: Observable<IMethod[]> = this.select((state) => state.serviceMethods);

    readonly getFeatureType = this.effect((data) => {
        return data.pipe(
            switchMap(() => {
                this.patchState({ isLoading: true });
                return this.service.getFeatureType().pipe(
                    tapResponse(
                        (res: BaseResponse<IFeatureType[], void>) => {
                            if (res?.hasError) {
                                this.showErrorMessages(res.errors);
                            }
                            return this.patchState({
                                isLoading: false,
                                featureType: res.data,
                            });
                        },
                        (error: any) => {
                            this.showErrorMessages(error.errors);
                            this.patchState({ isLoading: false, featureType: null });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly getServiceMethods = this.effect((data: Observable<number>) => {
        return data.pipe(
            switchMap((req: number) => {
                this.patchState({ isLoading: true });
                return this.service.getMethodService(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IMethod[], void>) => {
                            if (res?.hasError) {
                                this.showErrorMessages(res.errors);
                            }
                            return this.patchState({
                                isLoading: false,
                                serviceMethods: res?.data,
                            });
                        },
                        (error: any) => {
                            this.showErrorMessages(error.errors);
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

    private showErrorMessages(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
