import { Injectable } from '@angular/core';
import { BaseResponse, IPaginatedResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { IFeature, IFeatureReq } from '@proxy/models/features-model';
import { FeaturesService } from '@proxy/services/proxy/features';
export interface IFeatureInitialState {
    features: IPaginatedResponse<IFeature[]>;
    isLoading: boolean;
    hasSomeFeatures: boolean;
}

@Injectable()
export class FeatureComponentStore extends ComponentStore<IFeatureInitialState> {
    constructor(private service: FeaturesService, private toast: PrimeNgToastService) {
        super({
            features: null,
            isLoading: false,
            hasSomeFeatures: null,
        });
    }

    readonly loading$: Observable<{ [key: string]: boolean }> = this.select((state) => ({
        dataLoading: state.isLoading,
    }));
    readonly feature$: Observable<IPaginatedResponse<IFeature[]>> = this.select((state) => state.features);
    readonly hasSomeFeatures$: Observable<boolean> = this.select((state) => state.hasSomeFeatures);

    readonly getFeature = this.effect((data: Observable<IFeatureReq>) => {
        return data.pipe(
            switchMap((req: IFeatureReq) => {
                this.patchState({ isLoading: true });
                return this.service.getFeature(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IFeature[]>, IFeatureReq>) => {
                            if (res?.hasError) {
                                this.showErrorMessages(res?.errors);
                            }
                            return this.patchState({
                                isLoading: false,
                                features: res?.data,
                                ...(!req.search && {
                                    hasSomeFeatures: res.data.totalEntityCount > 0,
                                }),
                            });
                        },
                        (error: any) => {
                            this.showErrorMessages(error?.errors);
                            this.patchState({
                                isLoading: false,
                                features: null,
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
