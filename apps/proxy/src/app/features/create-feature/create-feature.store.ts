import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { IFeatureType } from '@proxy/models/features-model';
import { FeaturesService } from '@proxy/services/proxy/features';

export interface IFeatureInitialState {
    featureType: IFeatureType[];
    isLoading: boolean;
}

@Injectable()
export class FeatureComponentStore extends ComponentStore<IFeatureInitialState> {
    constructor(private service: FeaturesService, private toast: PrimeNgToastService) {
        super({
            featureType: null,
            isLoading: false,
        });
    }

    readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);
    readonly featureType$: Observable<IFeatureType[]> = this.select((state) => state.featureType);

    readonly getFeatureType = this.effect((data) => {
        return data.pipe(
            switchMap(() => {
                this.patchState({ isLoading: true });
                return this.service.getFeatureType().pipe(
                    tapResponse(
                        (res: BaseResponse<IFeatureType[], void>) => {
                            if (res.hasError) {
                                this.showErrorMessages(res['error']);
                            }
                            return this.patchState({
                                isLoading: false,
                                featureType: res.data,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.showErrorMessages(error['error']);
                            this.patchState({ isLoading: false, featureType: null });
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
