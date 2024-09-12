import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { errorResolver, IPaginatedResponse } from '@proxy/models/root-models';
import { EndpointService } from '@proxy/services/proxy/endpoint';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { Observable, switchMap } from 'rxjs';
import { IEndpointsRes } from '@proxy/models/endpoint';

export interface ICreateEndpointInitialState {
    singleEndpointData: IPaginatedResponse<IEndpointsRes[]>;
    isLoading: boolean;
}

@Injectable()
export class CreateEndpointComponentStore extends ComponentStore<ICreateEndpointInitialState> {
    constructor(private service: EndpointService, private toast: PrimeNgToastService, private router: Router) {
        super({
            singleEndpointData: null,
            isLoading: null,
        });
    }
    readonly singleEndpointData$: Observable<IPaginatedResponse<IEndpointsRes[]>> = this.select(
        (state) => state.singleEndpointData
    );

    readonly createEndpoint = this.effect((data: Observable<{ id: string | number; body: { [key: string]: any } }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.createEndpoint(req.id, req.body).pipe(
                    tapResponse(
                        (res) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('Endpoint created successfully');
                            const currentUrl = this.router.url;
                            const newUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
                            this.router.navigateByUrl(newUrl);
                            return this.patchState({
                                isLoading: false,
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
                    this.patchState({ isLoading: true });
                    return this.service.updateEndpoint(req.envProjectId, req.endpointId, req.body).pipe(
                        tapResponse(
                            (res: any) => {
                                if (res?.hasError) {
                                    this.showError(res.errors);
                                    return this.patchState({ isLoading: false });
                                }
                                this.toast.success('Endpoint update successfully');
                                const currentUrl = this.router.url;
                                const urlSegments = currentUrl.split('/');
                                const newUrl = urlSegments.slice(0, -2).join('/');
                                this.router.navigateByUrl(newUrl);

                                return this.patchState({
                                    isLoading: false,
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
    readonly getSingleEndpoint = this.effect(
        (data: Observable<{ envProjectId: string | number; endpointId: string | number }>) => {
            return data.pipe(
                switchMap((req) => {
                    this.patchState({ isLoading: true });
                    return this.service.getSingleEndpont(req.envProjectId, req.endpointId).pipe(
                        tapResponse(
                            (res: any) => {
                                if (res?.hasError) {
                                    this.showError(res.errors);
                                    return this.patchState({ isLoading: false });
                                }
                                return this.patchState({
                                    singleEndpointData: res.data,
                                    isLoading: false,
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
