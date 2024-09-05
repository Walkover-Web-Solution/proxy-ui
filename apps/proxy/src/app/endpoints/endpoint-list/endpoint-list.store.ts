import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { IProjects } from '@proxy/models/logs-models';
import { errorResolver, IPaginatedResponse } from '@proxy/models/root-models';
import { EndpointService } from '@proxy/services/proxy/endpoint';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { catchError, EMPTY, Observable, switchMap } from 'rxjs';
export interface IEndpointInitialState {
    endPointData: IPaginatedResponse<IProjects[]>;
    isLoading: boolean;
    deleteEndpoint: boolean;
}

@Injectable()
export class EndPointListComponentStore extends ComponentStore<any> {
    constructor(private service: EndpointService, private toast: PrimeNgToastService) {
        super({
            endPointData: null,
            isLoading: null,
            deleteEndpoint: null,
        });
    }
    /** Selector for API progress */
    readonly loading$: Observable<{ [key: string]: boolean }> = this.select((state) => ({
        dataLoading: state.isLoading,
    }));
    readonly endPointData$: Observable<IPaginatedResponse<IProjects[]>> = this.select((state) => state.endPointData);
    readonly deleteEndpoint$: Observable<boolean> = this.select((state) => state.deleteEndpoint);
    readonly getEndpointData = this.effect((data: Observable<{ id: string | number }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.getEndpointData(req.id).pipe(
                    tapResponse(
                        (res) => {
                            if (res.hasError) {
                                this.showError(res.errors);
                            }
                            return this.patchState((state) => ({
                                endPointData: res.data,
                                isLoading: false,
                            }));
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            return this.patchState({
                                envProjects: null,
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

    private showError(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
