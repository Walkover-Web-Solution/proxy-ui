import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseResponse, IPaginatedResponse, errorResolver } from "@proxy/models/root-models";
import { PrimeNgToastService } from "@proxy/ui/prime-ng-toast";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { IEnvProjects, ILogsData } from "@proxy/models/logs-models";
import { LogsService } from "@proxy/services/proxy/logs";
import { error } from "console";
import { EMPTY, Observable, catchError, switchMap } from "rxjs";

export interface ILogsInitialState  {
    logs: IPaginatedResponse<ILogsData[]>,
    envProjects: IPaginatedResponse<IEnvProjects[]>,
    isLoading: boolean
}

@Injectable()
export class LogsComponentStore extends ComponentStore<ILogsInitialState> {
    constructor(private service: LogsService,private toast: PrimeNgToastService ){
        super({
            logs: null,
            envProjects: null,
            isLoading: false,
        })
    }

    readonly logsData$: Observable<IPaginatedResponse<ILogsData[]>> = this.select((state) => state.logs);
    readonly envProjects$: Observable<IPaginatedResponse<IEnvProjects[]>> = this.select((state) => state.envProjects);
    readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);

    readonly getLogs = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((req : Observable<any>) => {
                this.setState((state) => ({...state, isLoading: true}))
                return this.service.getProxyLogs(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<ILogsData[]>, void>) => {
                            if(res.hasError){
                                this.showErrorMessages(res['error'])
                            }
                            return this.setState((state) => ({
                                ...state,
                                isLoading: false,
                                logs: res?.data
                            }))
                        },
                        (error: HttpErrorResponse) => {
                            this.showErrorMessages(error['error'])
                            return this.setState((state) => ({
                                ...state,
                                isLoading: false,
                                logs: null
                            }))
                        }
                    ),
                    catchError((err) => EMPTY)
                )
            })
        )
    });

    readonly getEnvProjects = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((req: Observable<any>) => {
                this.setState((state) => ({...state, isLoading: true}));
                return this.service.getEnvProjects().pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IEnvProjects[]>, void>) => {
                            if(res.hasError){
                                this.showErrorMessages(res['error'])
                            }
                            return this.setState((state) => ({
                                ...state,
                                isLoading: false,
                                envProjects: res?.data
                            }))
                        },
                        (error: HttpErrorResponse) => {
                            this.showErrorMessages(error['error'])
                            return this.setState((state) => ({
                                ...state,
                                isLoading: false,
                                envProjects: null
                            }))
                        }
                    ),
                    catchError((err) => EMPTY)
                )
            })
        )
    })

    private showErrorMessages(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((error) => {
            this.toast.error(error);
        });
    }
}