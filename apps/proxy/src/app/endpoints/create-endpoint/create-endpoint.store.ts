import { state } from '@angular/animations';
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { IProjects } from '@proxy/models/logs-models';
import { errorResolver, IPaginatedResponse } from '@proxy/models/root-models';
import { EndpointService } from '@proxy/services/proxy/endpoint';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { Observable, switchMap } from 'rxjs';

export interface ICreateEndpointInitialState {
    singleEndpointData: IPaginatedResponse<IProjects[]>;
}

@Injectable()
export class CreateEndpointComponentStore extends ComponentStore<any> {
    constructor(
        private service: EndpointService,
        private toast: PrimeNgToastService,
        private router: Router,
        private location: Location
    ) {
        super({
            singleEndpointData: null,
        });
    }
    readonly singleEndpointData$: Observable<any> = this.select((state) => state.singleEndpointData);

    readonly createEndpoint = this.effect((data: Observable<{ id: string | number; body: { [key: string]: any } }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.createEndpoint(req.id, req.body).pipe(
                    tapResponse(
                        (res: any) => {
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
            data: Observable<{ projectId: string | number; endpointId: string | number; body: { [key: string]: any } }>
        ) => {
            return data.pipe(
                switchMap((req) => {
                    this.patchState({ isLoading: true });
                    return this.service.updateEndpoint(req.projectId, req.endpointId, req.body).pipe(
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
                                    singleEndpointData: res.data,
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
