import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { IEndpointsRes } from '@proxy/models/endpoint';
import { errorResolver, IPaginatedResponse } from '@proxy/models/root-models';
import { EndpointService } from '@proxy/services/proxy/endpoint';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { catchError, EMPTY, Observable, switchMap } from 'rxjs';
export interface IEndpointInitialState {
    endPointData: IPaginatedResponse<IEndpointsRes[]>;
    isLoading: boolean;
    deleteEndpoint: boolean;
    statusUpdate: boolean;
}

@Injectable()
export class EndPointListComponentStore extends ComponentStore<IEndpointInitialState> {
    constructor(private service: EndpointService, private toast: PrimeNgToastService) {
        super({
            endPointData: null,
            isLoading: null,
            deleteEndpoint: null,
            statusUpdate: null,
        });
    }
    /** Selector for API progress */
    readonly loading$: Observable<{ [key: string]: boolean }> = this.select((state) => ({
        dataLoading: state.isLoading,
    }));

    readonly statusupdate$: Observable<boolean> = this.select((state) => state.statusUpdate);
    readonly endPointData$: Observable<IPaginatedResponse<IEndpointsRes[]>> = this.select(
        (state) => state.endPointData
    );
    readonly deleteEndpoint$: Observable<any> = this.select((state) => state.deleteEndpoint);
    readonly getEndpointData = this.effect((data: Observable<{ id: string | number }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.getEndpointData(req.id).pipe(
                    tapResponse(
                        (res) => {
                            if (res.hasError) {
                                this.showError(res.errors);
                                this.patchState({ isLoading: false });
                            }
                            return this.patchState((state) => ({
                                endPointData: res.data,
                                isLoading: false,
                            }));
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            return this.patchState({
                                isLoading: false,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    deleteEndpoint = this.effect((data: Observable<{ projectId: string | number; endpointId: string | number }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.deleteEndpoint(req.projectId, req.endpointId).pipe(
                    tapResponse(
                        (res) => {
                            if (res.hasError) {
                                this.showError(res.errors);
                            }

                            this.toast.success(res.data.message);
                            return this.patchState((state) => ({
                                isLoading: false,
                                deleteEndpoint: true,
                            }));
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            return this.patchState({
                                isLoading: false,
                                deleteEndpoint: false,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly updateEndpoint = this.effect(
        (
            data: Observable<{
                envProjectId: string | number;
                endpointId: string | number;
                body: { [key: string]: any };
            }>
        ) => {
            return data.pipe(
                switchMap((req) => {
                    this.patchState({ isLoading: true, statusUpdate: false });
                    return this.service.updateEndpoint(req.envProjectId, req.endpointId, req.body).pipe(
                        tapResponse(
                            (res: any) => {
                                if (res?.hasError) {
                                    this.showError(res.errors);
                                    return this.patchState({ isLoading: false, statusUpdate: false });
                                }
                                this.toast.success('Endpoint update successfully');

                                return this.patchState({
                                    isLoading: false,
                                    statusUpdate: true,
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
