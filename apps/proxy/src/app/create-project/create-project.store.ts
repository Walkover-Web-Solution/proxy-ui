import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { IEnvironments, IProjects } from '@proxy/models/logs-models';
import { BaseResponse, IPaginatedResponse, IReqParams, errorResolver } from '@proxy/models/root-models';
import { CreateProjectService } from '@proxy/services/proxy/create-project';

import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';

import { EMPTY, Observable, catchError, switchMap } from 'rxjs';

export interface ICreateProjectInitialState {
    projects: IPaginatedResponse<IProjects[]>;
    environments: IPaginatedResponse<IEnvironments[]>;
    sourceDomain: any;
    isLoading: boolean;
}

@Injectable()
export class CreateProjectComponentStore extends ComponentStore<ICreateProjectInitialState> {
    constructor(private service: CreateProjectService, private toast: PrimeNgToastService, private router: Router) {
        super({
            projects: null,
            environments: null,
            sourceDomain: null,
            isLoading: false,
        });
    }

    readonly projects$: Observable<IPaginatedResponse<IProjects[]>> = this.select((state) => state.projects);
    readonly environments$: Observable<IPaginatedResponse<IEnvironments[]>> = this.select(
        (state) => state.environments
    );
    readonly sourceDomain$: Observable<any> = this.select((state) => state.sourceDomain);

    s;
    readonly getEnvironment = this.effect((data: Observable<IReqParams>) => {
        return data.pipe(
            switchMap((req) => {
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
                );
            })
        );
    });
    readonly getProjects = this.effect((data) => {
        return data.pipe(
            switchMap((req) => {
                return this.service.getProjects().pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IProjects[]>, void>) => {
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
                                projects: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly createSource = this.effect((data: Observable<{ [key: string]: unknown }>) => {
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

                            this.patchState({
                                isLoading: false,
                                sourceDomain: res.data,
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
                            this.router.navigate(['/app']);
                            return res;
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
