import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { IEnvironments, IProjects } from '@proxy/models/logs-models';
import { BaseResponse, IPaginatedResponse, IReqParams, errorResolver } from '@proxy/models/root-models';
import { CreateProjectService } from '@proxy/services/proxy/create-project';

import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { LogsService } from '@proxy/services/proxy/logs';

import { EMPTY, Observable, catchError, switchMap } from 'rxjs';

export interface ICreateProjectInitialState {
    // isInitialized: boolean;
    projects: IPaginatedResponse<IProjects[]>;
    environments: IPaginatedResponse<IEnvironments[]>;
    sourceDomain: any;
    isLoading: boolean;
}

@Injectable()
export class CreateProjectComponentStore extends ComponentStore<ICreateProjectInitialState> {
    constructor(private service: CreateProjectService, private toast: PrimeNgToastService, logService: LogsService) {
        super({
            // isInitialized: false,
            projects: null,
            environments: null,
            sourceDomain: null,
            isLoading: false,
        });
    }
    // readonly initializeStore = this.updater((state) => ({
    //     ...state,
    //     isInitialized: true,
    // }));
    readonly projects$: Observable<IPaginatedResponse<IProjects[]>> = this.select((state) => state.projects);
    readonly environments$: Observable<IPaginatedResponse<IEnvironments[]>> = this.select(
        (state) => state.environments
    );
    readonly sourceDomain$: Observable<any> = this.select((state) => state.sourceDomain);

    s;
    readonly getEnvironment = this.effect((data: Observable<IReqParams>) => {
        return data.pipe(
            switchMap((req) => {
                // this.patchState({ environmentsInProcess: true });
                return this.service.getEnvironments(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IEnvironments[]>, void>) => {
                            if (res.hasError) {
                                this.showError(res.errors);
                            }
                            return this.patchState((state) => ({
                                environmentsInProcess: false,
                                environments:
                                    res?.data?.pageNo > 1
                                        ? { ...res.data, data: [...state.environments.data, ...res.data.data] }
                                        : res.data,
                            }));
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            return this.patchState({
                                // environmentsInProcess: false,
                                environments: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly createProject = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.createProject(req).pipe(
                    tapResponse(
                        (res: any) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('Project created successfully');
                            this.getProjects();
                            return this.patchState({
                                isLoading: false,
                            });
                        },
                        (error: any) => {
                            this.getProjects();
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    )
                    // catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly getProjects = this.effect((data) => {
        return data.pipe(
            switchMap((req) => {
                // this.patchState({ projectsInProcess: true });
                return this.service.getProjects().pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IProjects[]>, void>) => {
                            console.log(res);
                            if (res.hasError) {
                                this.showError(res.errors);
                            }
                            return this.patchState((state) => ({
                                projectsInProcess: false,
                                projects:
                                    res?.data?.pageNo > 1
                                        ? { ...res.data, data: [...state.projects.data, ...res.data.data] }
                                        : res.data,
                            }));
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            return this.patchState({
                                // projectsInProcess: false,
                                projects: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly createSource$ = this.effect((data: Observable<{ [key: string]: any }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.createSource(req).pipe(
                    tapResponse(
                        (res: any) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('Source created successfully');

                            return this.patchState({
                                isLoading: false,
                                sourceDomain: res.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    )
                    // catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly updateProject = this.effect((data: Observable<{ id: string | number; body: { [key: string]: any } }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.service.updateProject(req.id, req.body).pipe(
                    tapResponse(
                        (res) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('project updated successfully');
                            return this.patchState({
                                isLoading: false,
                                // createUpdateObject: res.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
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
