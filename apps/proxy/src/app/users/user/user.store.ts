import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { IUser, IUserReq } from '@proxy/models/users-model';
import { UsersService } from '@proxy/services/proxy/users';
import { BaseResponse, IPaginatedResponse, errorResolver } from '@proxy/models/root-models';
import { HttpWrapperService } from '@proxy/services/httpWrapper';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';

export interface IUserInitialState {
    users: IPaginatedResponse<IUser[]>;
    isLoading: boolean;
}
@Injectable()
export class UserComponentStore extends ComponentStore<IUserInitialState> {
    constructor(private service: UsersService, private toast: PrimeNgToastService) {
        super({
            users: null,
            isLoading: false,
        });
    }

    readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);
    readonly users$: Observable<IPaginatedResponse<IUser[]>> = this.select((state) => state.users);

    readonly getUsers = this.effect((data: Observable<IUserReq>) => {
        return data.pipe(
            switchMap((req: IUserReq) => {
                this.patchState({ isLoading: true });
                return this.service.getUsers(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IUser[]>, IUserReq>) => {
                            if (res?.hasError) {
                                this.showErrorMessages(res?.errors);
                            }
                            return this.patchState({
                                isLoading: false,
                                users: res?.data,
                            });
                        },
                        (error: any) => {
                            this.showErrorMessages(error?.errors);
                            return this.patchState({
                                isLoading: false,
                                users: null,
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
