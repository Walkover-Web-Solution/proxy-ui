import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { IEnvProject } from '@proxy/models/endpoint';
import { BaseResponse, errorResolver, IPaginatedResponse, IReqParams } from '@proxy/models/root-models';
import { EndpointService } from '@proxy/services/proxy/endpoint';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { catchError, EMPTY, Observable, switchMap } from 'rxjs';

export interface IEnvProjectInitialState {
    envProjects: IPaginatedResponse<IEnvProject[]>;
    isLoading: boolean;
}

@Injectable()
export class EnvProjectComponentStore extends ComponentStore<IEnvProjectInitialState> {
    constructor(private service: EndpointService, private toast: PrimeNgToastService) {
        super({
            envProjects: null,
            isLoading: null,
        });
    }

    readonly loading$: Observable<{ [key: string]: boolean }> = this.select((state) => ({
        dataLoading: state.isLoading,
    }));

    readonly envProject$: Observable<IPaginatedResponse<IEnvProject[]>> = this.select((state) => state.envProjects);

    readonly getEnvProject = this.effect((data: Observable<IReqParams>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.getEnvProject(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IEnvProject[]>, void>) => {
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
