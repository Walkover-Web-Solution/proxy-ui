import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { errorResolver } from '@proxy/models/root-models';
import { EndpointService } from '@proxy/services/proxy/endpoint';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { Observable, switchMap } from 'rxjs';

export interface IPoliciesInitialState {
    policyType: any;
    isLoading: boolean;
    singleEndpointData: any;
}
@Injectable()
export class NewMethodDialogComponentStore extends ComponentStore<IPoliciesInitialState> {
    constructor(private service: EndpointService, private toast: PrimeNgToastService) {
        super({
            policyType: null,
            isLoading: null,
            singleEndpointData: null,
        });
    }

    /** Selector for API progress  */
    readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);
    /** Selector for feature type data */
    readonly policyType$: Observable<any> = this.select((state) => state.policyType);

    readonly singleEndpointData$: Observable<any> = this.select((state) => state.singleEndpointData);

    readonly getPolicies = this.effect((data) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.verficationIntegration(req).pipe(
                    tapResponse(
                        (res: any) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            return this.patchState({
                                isLoading: false,
                                policyType: res?.data ?? null,
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
    readonly createPolicies = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.createPolicy(req).pipe(
                    tapResponse(
                        (res: any) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            return this.patchState({
                                isLoading: false,
                                policyType: res?.data ?? null,
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
    readonly getSingleEndpointData = this.effect(
        (data: Observable<{ projectId: string | number; endpointId: string | number }>) => {
            return data.pipe(
                switchMap((req) => {
                    this.patchState({ isLoading: true });
                    return this.service.getSingleEndpont(req.projectId, req.endpointId).pipe(
                        tapResponse(
                            (res: any) => {
                                if (res?.hasError) {
                                    this.showError(res.errors);
                                    return this.patchState({ isLoading: false });
                                }
                                return this.patchState({
                                    isLoading: false,
                                    singleEndpointData: res?.data ?? null,
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
        }
    );
    private showError(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
