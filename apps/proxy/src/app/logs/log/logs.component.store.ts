import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseResponse, IPaginatedResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { IEnvProjects, ILogsReq, ILogsRes } from '@proxy/models/logs-models';
import { LogsService } from '@proxy/services/proxy/logs';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';

export interface ILogsInitialState {
    logs: IPaginatedResponse<ILogsRes[]>;
    envProjects: IPaginatedResponse<IEnvProjects[]>;
    reqLogs: any;
    isLoading: boolean;
}

@Injectable()
export class LogsComponentStore extends ComponentStore<ILogsInitialState> {
    constructor(private service: LogsService, private toast: PrimeNgToastService) {
        super({
            logs: null,
            envProjects: null,
            isLoading: false,
            reqLogs: null,
        });
    }

    readonly logsData$: Observable<IPaginatedResponse<ILogsRes[]>> = this.select((state) => state.logs);
    readonly envProjects$: Observable<IPaginatedResponse<IEnvProjects[]>> = this.select((state) => state.envProjects);
    readonly reqLogs$: Observable<any> = this.select((state) => state.reqLogs);
    readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);

    readonly getLogs = this.effect((data: Observable<ILogsReq>) => {
        return data.pipe(
            switchMap((req: ILogsReq) => {
                this.patchState({ isLoading: true });
                return this.service.getProxyLogs(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<ILogsRes[]>, ILogsReq>) => {
                            if (res.hasError) {
                                this.showErrorMessages(res['error']);
                            }
                            return this.patchState({
                                isLoading: false,
                                logs: res?.data,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.showErrorMessages(error['error']);
                            return this.patchState({
                                isLoading: false,
                                logs: null,
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
                this.patchState({ isLoading: true, reqLogs: null });
                return this.service.getProxyLogsById(req).pipe(
                    tapResponse(
                        (res: any) => {
                            if (res.hasError) {
                                this.showErrorMessages(res['error']);
                            }
                            return this.patchState({
                                isLoading: false,
                                reqLogs: res?.data,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.showErrorMessages(error['error']);
                            return this.patchState({
                                isLoading: false,
                                reqLogs: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });

    readonly getEnvProjects = this.effect((data) => {
        return data.pipe(
            switchMap(() => {
                this.patchState({ isLoading: true });
                return this.service.getEnvProjects().pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IEnvProjects[]>, void>) => {
                            if (res.hasError) {
                                this.showErrorMessages(res['error']);
                            }
                            return this.patchState({
                                isLoading: false,
                                envProjects: res?.data,
                            });
                        },
                        (error: HttpErrorResponse) => {
                            this.showErrorMessages(error['error']);
                            return this.patchState({
                                isLoading: false,
                                envProjects: null,
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
}
