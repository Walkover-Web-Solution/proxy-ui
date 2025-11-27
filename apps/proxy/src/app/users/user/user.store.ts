import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { IUser, IUserReq } from '@proxy/models/users-model';
import { UsersService } from '@proxy/services/proxy/users';
import { BaseResponse, IPaginatedResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { FeaturesService } from '@proxy/services/proxy/features';
import { IFeature } from '@proxy/models/features-model';

export interface IUserInitialState {
    users: IPaginatedResponse<IUser[]>;
    roles: IPaginatedResponse<any[]>;
    createRole: any;
    updateRole: any;
    deleteRole: any;
    permissions: IPaginatedResponse<any[]>;
    createPermission: any;
    deletePermission: any;
    updatePermission: any;
    featureDetails: any;
    createUpdateObject: IFeature;
    isLoading: boolean;
}
@Injectable()
export class UserComponentStore extends ComponentStore<IUserInitialState> {
    constructor(
        private service: UsersService,
        private featureService: FeaturesService,
        private toast: PrimeNgToastService
    ) {
        super({
            users: null,
            roles: null,
            createRole: null,
            updateRole: null,
            deleteRole: null,
            permissions: null,
            createPermission: null,
            deletePermission: null,
            updatePermission: null,
            featureDetails: null,
            createUpdateObject: null,
            isLoading: false,
        });
    }

    /** Selector for API progress */
    readonly loading$: Observable<{ [key: string]: boolean }> = this.select((state) => ({
        dataLoading: state.isLoading,
    }));
    /** Selector for user data */
    readonly users$: Observable<IPaginatedResponse<IUser[]>> = this.select((state) => state.users);
    readonly roles$: Observable<IPaginatedResponse<any[]>> = this.select((state) => state.roles);
    readonly createRole$: Observable<any> = this.select((state) => state.createRole);
    readonly updateRole$: Observable<any> = this.select((state) => state.updateRole);
    readonly deleteRole$: Observable<any> = this.select((state) => state.deleteRole);
    readonly permissions$: Observable<IPaginatedResponse<any[]>> = this.select((state) => state.permissions);
    readonly createPermission$: Observable<any> = this.select((state) => state.createPermission);
    readonly deletePermission$: Observable<any> = this.select((state) => state.deletePermission);
    readonly updatePermission$: Observable<any> = this.select((state) => state.updatePermission);
    readonly featureDetails$: Observable<any> = this.select((state) => state.featureDetails);
    readonly createUpdateObject$: Observable<IFeature> = this.select((state) => state.createUpdateObject);
    /** Get users data */
    readonly getUsers = this.effect((data: Observable<IUserReq>) => {
        return data.pipe(
            switchMap((req: IUserReq) => {
                this.patchState({ isLoading: true });
                return this.service.getUsers(req).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IUser[]>, IUserReq>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            }
                            return this.patchState({
                                isLoading: false,
                                users: res?.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors);
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

    readonly getRoles = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((params) => {
                return this.service.getRoles(params).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<any[]>, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            }
                            return this.patchState({
                                roles: res?.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors);
                            return this.patchState({
                                roles: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly createRole = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((payload) => {
                this.patchState({ isLoading: true });
                return this.service.createRole(payload).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            } else {
                                this.toast.success('Role created successfully');
                            }
                            return this.patchState({
                                createRole: res?.data,
                                isLoading: false,
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors);
                            return this.patchState({
                                isLoading: false,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly updateRole = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((payload) => {
                this.patchState({ isLoading: true });
                return this.service.updateRole(payload).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            } else {
                                this.toast.success('Role updated successfully');
                            }
                            return this.patchState({
                                updateRole: res?.data,
                                isLoading: false,
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors);
                            return this.patchState({
                                isLoading: false,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly deleteRole = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((payload) => {
                this.patchState({ isLoading: true });
                return this.service.deleteRole(payload).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            } else {
                                this.toast.success('Role deleted successfully');
                            }
                            return this.patchState({
                                deleteRole: res?.data,
                                isLoading: false,
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors);
                            return this.patchState({
                                isLoading: false,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly getPermissions = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((params) => {
                return this.service.getPermissions(params).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<any[]>, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            }
                            return this.patchState({
                                permissions: res?.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors);
                            return this.patchState({
                                permissions: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly createPermission = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((payload) => {
                this.patchState({ isLoading: true });
                return this.service.createPermission(payload).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            } else {
                                this.toast.success('Permission created successfully');
                            }
                            return this.patchState({
                                createPermission: res?.data,
                                isLoading: false,
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors);
                            return this.patchState({
                                isLoading: false,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    // readonly updatePermission = this.effect((data: Observable<any>) => {
    //     return data.pipe(
    //         switchMap((payload) => {
    //             this.patchState({ isLoading: true });
    //             return this.service.updatePermission(payload).pipe(
    //                 tapResponse(
    //                     (res: BaseResponse<any, void>) => {
    //                         if (res?.hasError) {
    //                             this.showError(res?.errors);
    //                         }
    //                         else {
    //                             this.toast.success('Permission updated successfully');
    //                             // Reload permissions after successful update
    //                             const referenceId = payload.referenceId;
    //                             this.getPermissions({ referenceId });
    //                         }
    //                         return this.patchState({
    //                             updatePermission: res?.data,
    //                             isLoading: false,
    //                         });
    //                     },
    //                     (error: any) => {
    //                         this.showError(error?.errors);
    //                         return this.patchState({
    //                             isLoading: false,
    //                         });
    //                     }
    //                 ),
    //                 catchError((err) => EMPTY)
    //             );
    //         })
    //     );
    // });
    readonly deletePermission = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((payload) => {
                this.patchState({ isLoading: true });
                return this.service.deletePermission(payload).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            } else {
                                this.toast.success('Permission deleted successfully');
                            }
                            return this.patchState({
                                deletePermission: res?.data,
                                isLoading: false,
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors);
                            return this.patchState({
                                isLoading: false,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly updatePermission = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((payload) => {
                this.patchState({ isLoading: true });
                return this.service.updatePermission(payload).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            } else {
                                this.toast.success('Permission updated successfully');
                            }
                            return this.patchState({
                                updatePermission: res?.data,
                                isLoading: false,
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors);
                            return this.patchState({
                                isLoading: false,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly getFeatureDetails = this.effect((data: Observable<any>) => {
        return data.pipe(
            switchMap((payload) => {
                return this.featureService.getFeatureDetails(payload).pipe(
                    tapResponse(
                        (res: BaseResponse<any, void>) => {
                            return this.patchState({
                                featureDetails: res?.data,
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors);
                            return this.patchState({
                                featureDetails: null,
                            });
                        }
                    ),
                    catchError((err) => EMPTY)
                );
            })
        );
    });
    readonly updateFeature = this.effect((data: Observable<{ id: string | number; body: { [key: string]: any } }>) => {
        return data.pipe(
            switchMap((req) => {
                this.patchState({ isLoading: true });
                return this.featureService.updateFeature(req.id, req.body).pipe(
                    tapResponse(
                        (res: BaseResponse<IFeature, void>) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({ isLoading: false });
                            }
                            this.toast.success('Feature updated successfully');
                            return this.patchState({
                                isLoading: false,
                                createUpdateObject: res.data,
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
