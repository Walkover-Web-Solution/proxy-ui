import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { IEnvironments, IProjects } from '@proxy/models/logs-models';
import { BaseResponse, errorResolver, IPaginatedResponse, IReqParams } from '@proxy/models/root-models';

import { EndpointService } from '@proxy/services/proxy/endpoint';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';

import { catchError, EMPTY, Observable, switchMap } from 'rxjs';

export interface IEndpointInitialState {
    envProjects: IPaginatedResponse<IProjects[]>;
    endPointData: IPaginatedResponse<IProjects[]>;
    isLoading: boolean;
    deleteEndpoint: boolean;
}

@Injectable()
export class EndpointComponentStore extends ComponentStore<any> {
    constructor(private service: EndpointService, private toast: PrimeNgToastService) {
        super({
            envProjects: null,
            endPointData: null,
            isLoading: null,
            deleteEndpoint: null,
        });
    }
    /** Selector for API progress */
    readonly loading$: Observable<{ [key: string]: boolean }> = this.select((state) => ({
        dataLoading: state.isLoading,
    }));

    readonly envProject$: Observable<IPaginatedResponse<IProjects[]>> = this.select((state) => state.envProjects);
    readonly endPointData$: Observable<IPaginatedResponse<IProjects[]>> = this.select((state) => state.endPointData);
    readonly deleteEndpoint$: Observable<boolean> = this.select((state) => state.deleteEndpoint);
    readonly getEnvProject = this.effect((data: Observable<IReqParams>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.getEnvProject(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IEnvironments[]>, void>) => {
                            if (res.hasError) {
                                this.showError(res.errors);
                            }
                            return this.patchState((state) => ({
                                envProjects: res.data,
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

    private showError(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}
