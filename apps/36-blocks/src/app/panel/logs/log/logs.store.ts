import { Injectable } from '@angular/core';
import { BaseResponse, IPaginatedResponse, errorResolver, IReqParams } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { IEnvironments, ILogDetailRes, ILogsReq, ILogsRes, IProjects } from '@proxy/models/logs-models';
import { LogsService } from '@proxy/services/proxy/logs';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';

export interface ILogsInitialState {
    logs: IPaginatedResponse<ILogsRes[]>;
    logsInProcess: boolean;
    logsError: string | null;
    environments: IPaginatedResponse<IEnvironments[]>;
    environmentsInProcess: boolean;
    projects: IPaginatedResponse<IProjects[]>;
    projectsInProcess: boolean;
    reqLogs: ILogDetailRes;
    reqLogsInProcess: boolean;
    reqLogsError: string | null;
}

@Injectable()
export class LogsComponentStore extends ComponentStore<ILogsInitialState> {
    constructor(
        private service: LogsService,
        private toast: PrimeNgToastService
    ) {
        super({
            logs: null,
            logsInProcess: false,
            logsError: null,
            environments: null,
            environmentsInProcess: false,
            projects: null,
            projectsInProcess: false,
            reqLogs: null,
            reqLogsInProcess: false,
            reqLogsError: null,
        });
    }

    readonly logsData$: Observable<IPaginatedResponse<ILogsRes[]>> = this.select((state) => state.logs);
    readonly environments$: Observable<IPaginatedResponse<IEnvironments[]>> = this.select(
        (state) => state.environments
    );
    readonly projects$: Observable<IPaginatedResponse<IProjects[]>> = this.select((state) => state.projects);
    readonly logsError$ = this.select((state) => state.logsError);
    readonly reqLogsError$ = this.select((state) => state.reqLogsError);
    readonly reqLogs$: Observable<ILogDetailRes> = this.select((state) => state.reqLogs);
    readonly isLoading$: Observable<boolean> = this.select(
        (state) => state.logsInProcess || state.environmentsInProcess || state.projectsInProcess
    );
    readonly reqLogsInProcess$: Observable<boolean> = this.select((state) => state.reqLogsInProcess);

    readonly resetReqLog = this.updater((state) => ({ ...state, reqLogs: null, reqLogsError: null }));

    readonly getLogs = this.effect((data: Observable<ILogsReq>) => {
        return data.pipe(
            switchMap((req: ILogsReq) => {
                this.patchState({ logsInProcess: true, logsError: null, logs: null });
                return this.service.getProxyLogs(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<ILogsRes[]>, ILogsReq>) => {
                            const failed = !res || res.hasError || !Array.isArray(res.data?.data);
                            if (res?.hasError) {
                                this.showErrorMessages(res.errors);
                            }
                            return this.patchState({
                                logsInProcess: false,
                                logs: failed ? null : res.data,
                                logsError: failed
                                    ? 'Logs could not be loaded. Retry or check the logging service.'
                                    : null,
                            });
                        },
                        (error: any) => {
                            this.showErrorMessages(error.errors);
                            return this.patchState({
                                logsInProcess: false,
                                logs: null,
                                logsError: 'Logs could not be loaded. Retry or check the logging service.',
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly getLogsById = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((req: any) => {
                this.patchState({ reqLogsInProcess: true, reqLogs: null, reqLogsError: null });
                return this.service.getProxyLogsById(req).pipe(
                    tapResponse(
                        (res: BaseResponse<ILogDetailRes, void>) => {
                            const failed =
                                !res ||
                                res.hasError ||
                                !res.data ||
                                typeof res.data !== 'object' ||
                                Array.isArray(res.data);
                            if (res?.hasError) {
                                this.showErrorMessages(res.errors);
                            }
                            return this.patchState({
                                reqLogsInProcess: false,
                                reqLogsError: failed ? 'Log details could not be loaded. Retry this request.' : null,
                                reqLogs: failed
                                    ? null
                                    : {
                                          ...res.data,
                                          request_body: this.parseJson(res?.data?.request_body),
                                          headers: this.parseJson(res?.data?.headers),
                                          response: this.parseJson(res?.data?.response),
                                      },
                            });
                        },
                        (error: any) => {
                            this.showErrorMessages(error.errors);
                            return this.patchState({
                                reqLogsInProcess: false,
                                reqLogs: null,
                                reqLogsError: 'Log details could not be loaded. Retry this request.',
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly getEnvironment = this.effect((data: Observable<IReqParams>) => {
        return data.pipe(
            switchMap((req: IReqParams) => {
                this.patchState({ environmentsInProcess: true });
                return this.service.getEnvironments(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IEnvironments[]>, void>) => {
                            if (res.hasError) {
                                this.showErrorMessages(res.errors);
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
                            this.showErrorMessages(error.errors);
                            return this.patchState({
                                environmentsInProcess: false,
                                environments: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly getProjects = this.effect((data: Observable<IReqParams>) => {
        return data.pipe(
            switchMap((req: IReqParams) => {
                this.patchState({ projectsInProcess: true });
                return this.service.getProjects(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IProjects[]>, void>) => {
                            if (res.hasError) {
                                this.showErrorMessages(res.errors);
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
                            this.showErrorMessages(error.errors);
                            return this.patchState({
                                projectsInProcess: false,
                                projects: null,
                            });
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

    private parseJson(value: any): any {
        if (typeof value === 'string') {
            try {
                return this.parseJson(JSON.parse(value));
            } catch (e) {
                return value;
            }
        } else {
            return value;
        }
    }
}
