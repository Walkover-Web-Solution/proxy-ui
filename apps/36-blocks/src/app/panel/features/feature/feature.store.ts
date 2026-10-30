import { Injectable } from '@angular/core';
import { BaseResponse, IPaginatedResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { IFeature, IFeatureReq } from '@proxy/models/features-model';
import { FeaturesService } from '@proxy/services/proxy/features';
export interface IFeatureInitialState {
    features: IPaginatedResponse<IFeature[]>;
    isLoading: boolean;
    hasSomeFeatures: boolean;
    error: string | null;
}

@Injectable()
export class FeatureComponentStore extends ComponentStore<IFeatureInitialState> {
    constructor(
        private service: FeaturesService,
        private toast: PrimeNgToastService
    ) {
        super({
            features: null,
            isLoading: false,
            hasSomeFeatures: null,
            error: null,
        });
    }

    readonly loading$: Observable<{ [key: string]: boolean }> = this.select((state) => ({
        dataLoading: state.isLoading,
    }));
    readonly feature$: Observable<IPaginatedResponse<IFeature[]>> = this.select((state) => state.features);
    readonly error$ = this.select((state) => state.error);
    readonly hasSomeFeatures$: Observable<boolean> = this.select((state) => state.hasSomeFeatures);

    readonly getFeature = this.effect((data: Observable<IFeatureReq>) => {
        return data.pipe(
            switchMap((req: IFeatureReq) => {
                this.patchState({ isLoading: true, error: null });
                return this.service.getFeature(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IFeature[]>, IFeatureReq>) => {
                            const failed = res?.hasError || !Array.isArray(res?.data?.data);
                            return this.patchState({
                                isLoading: false,
                                features: failed ? null : res.data,
                                error: failed
                                    ? 'Applications could not be loaded. Retry or check your workspace access.'
                                    : null,
                                ...(!req.search && !failed && { hasSomeFeatures: res.data.totalEntityCount > 0 }),
                            });
                        },
                        (error: any) => {
                            this.showErrorMessages(error?.errors);
                            this.patchState({
                                isLoading: false,
                                features: null,
                                error:
                                    error?.status === 403 || error?.errorCode === 403
                                        ? 'You need permission to view applications in this workspace. Ask an administrator.'
                                        : 'Applications could not be loaded. Check your connection and retry.',
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
