import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { FeaturesService } from '@proxy/services/proxy/features';
import {
    IBlockScope,
    IBlockScopeCreatePayload,
    IBlockScopeUpdatePayload,
    IOAuthConfig,
    IOAuthConfigCreatePayload,
    IOAuthConfigUpdatePayload,
} from '@proxy/models/features-model';
import { BaseResponse, IPaginatedResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';

export interface IOauthListParams {
    featureId: string | number;
    itemsPerPage: number;
    pageNo: number;
    search?: string;
}

export interface IOauthConfigState {
    oauthConfigs: IPaginatedResponse<IOAuthConfig[]> | null;
    blockScopes: IPaginatedResponse<IBlockScope[]> | null;
    /** Full-ish catalog for allowed_scopes picker (not tied to Scope table page). */
    blockScopeCatalog: IBlockScope[];
    createOauthConfig: IOAuthConfig | null;
    updateOauthConfig: IOAuthConfig | null;
    deleteOauthConfig: any;
    regenerateSecret: IOAuthConfig | null;
    disableOauthConfig: IOAuthConfig | null;
    createBlockScope: IBlockScope | null;
    updateBlockScope: IBlockScope | null;
    deleteBlockScope: any;
    isLoading: boolean;
}

@Injectable()
export class OauthConfigComponentStore extends ComponentStore<IOauthConfigState> {
    constructor(
        private service: FeaturesService,
        private toast: PrimeNgToastService
    ) {
        super({
            oauthConfigs: null,
            blockScopes: null,
            blockScopeCatalog: [],
            createOauthConfig: null,
            updateOauthConfig: null,
            deleteOauthConfig: null,
            regenerateSecret: null,
            disableOauthConfig: null,
            createBlockScope: null,
            updateBlockScope: null,
            deleteBlockScope: null,
            isLoading: false,
        });
    }

    readonly loading$ = this.select((state) => ({ dataLoading: state.isLoading }));
    readonly oauthConfigs$ = this.select((state) => state.oauthConfigs);
    readonly blockScopes$ = this.select((state) => state.blockScopes);
    readonly blockScopeCatalog$ = this.select((state) => state.blockScopeCatalog);
    readonly createOauthConfig$ = this.select((state) => state.createOauthConfig);
    readonly updateOauthConfig$ = this.select((state) => state.updateOauthConfig);
    readonly deleteOauthConfig$ = this.select((state) => state.deleteOauthConfig);
    readonly regenerateSecret$ = this.select((state) => state.regenerateSecret);
    readonly disableOauthConfig$ = this.select((state) => state.disableOauthConfig);
    readonly createBlockScope$ = this.select((state) => state.createBlockScope);
    readonly updateBlockScope$ = this.select((state) => state.updateBlockScope);
    readonly deleteBlockScope$ = this.select((state) => state.deleteBlockScope);

    readonly getOauthConfigs = this.effect((data: Observable<IOauthListParams>) => {
        return data.pipe(
            switchMap(({ featureId, itemsPerPage, pageNo, search }) => {
                this.patchState({ isLoading: true });
                const params: any = { itemsPerPage, pageNo };
                if (search?.trim()) {
                    params.search = search.trim();
                }
                return this.service.getOauthConfigs(featureId, params).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IOAuthConfig[]>, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            }
                            this.patchState({
                                isLoading: false,
                                oauthConfigs: this.normalizePaginated<IOAuthConfig>(res?.data),
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors ?? error?.error?.errors);
                            this.patchState({
                                isLoading: false,
                                oauthConfigs: this.emptyPage<IOAuthConfig>(),
                            });
                        }
                    ),
                    catchError(() => EMPTY)
                );
            })
        );
    });

    readonly createOauthConfig = this.effect(
        (data: Observable<{ featureId: string | number; body: IOAuthConfigCreatePayload }>) => {
            return data.pipe(
                switchMap(({ featureId, body }) => {
                    this.patchState({ isLoading: true, createOauthConfig: null });
                    return this.service.createOauthConfig(featureId, body).pipe(
                        tapResponse(
                            (res: BaseResponse<IOAuthConfig, void>) => {
                                if (res?.hasError) {
                                    this.showError(res?.errors);
                                } else {
                                    this.toast.success('OAuth config created successfully');
                                }
                                this.patchState({
                                    isLoading: false,
                                    createOauthConfig: res?.hasError ? null : res?.data,
                                });
                            },
                            (error: any) => {
                                this.showError(error?.errors ?? error?.error?.errors);
                                this.patchState({ isLoading: false, createOauthConfig: null });
                            }
                        ),
                        catchError(() => EMPTY)
                    );
                })
            );
        }
    );

    readonly updateOauthConfig = this.effect(
        (
            data: Observable<{
                featureId: string | number;
                oauthConfigId: string | number;
                body: IOAuthConfigUpdatePayload;
            }>
        ) => {
            return data.pipe(
                switchMap(({ featureId, oauthConfigId, body }) => {
                    this.patchState({ isLoading: true, updateOauthConfig: null });
                    return this.service.updateOauthConfig(featureId, oauthConfigId, body).pipe(
                        tapResponse(
                            (res: BaseResponse<IOAuthConfig, void>) => {
                                if (res?.hasError) {
                                    this.showError(res?.errors);
                                } else if (body?.status === 'active') {
                                    this.toast.success('OAuth config enabled successfully');
                                } else {
                                    this.toast.success('OAuth config updated successfully');
                                }
                                this.patchState({
                                    isLoading: false,
                                    updateOauthConfig: res?.hasError ? null : res?.data,
                                });
                            },
                            (error: any) => {
                                this.showError(error?.errors ?? error?.error?.errors);
                                this.patchState({ isLoading: false, updateOauthConfig: null });
                            }
                        ),
                        catchError(() => EMPTY)
                    );
                })
            );
        }
    );

    readonly deleteOauthConfig = this.effect(
        (data: Observable<{ featureId: string | number; oauthConfigId: string | number }>) => {
            return data.pipe(
                switchMap(({ featureId, oauthConfigId }) => {
                    this.patchState({ isLoading: true, deleteOauthConfig: null });
                    return this.service.deleteOauthConfig(featureId, oauthConfigId).pipe(
                        tapResponse(
                            (res: BaseResponse<any, void>) => {
                                if (res?.hasError) {
                                    this.showError(res?.errors);
                                } else {
                                    this.toast.success('OAuth config deleted successfully');
                                }
                                this.patchState({
                                    isLoading: false,
                                    deleteOauthConfig: res?.hasError ? null : (res?.data ?? true),
                                });
                            },
                            (error: any) => {
                                this.showError(error?.errors ?? error?.error?.errors);
                                this.patchState({ isLoading: false, deleteOauthConfig: null });
                            }
                        ),
                        catchError(() => EMPTY)
                    );
                })
            );
        }
    );

    readonly regenerateOauthSecret = this.effect(
        (data: Observable<{ featureId: string | number; oauthConfigId: string | number }>) => {
            return data.pipe(
                switchMap(({ featureId, oauthConfigId }) => {
                    this.patchState({ isLoading: true, regenerateSecret: null });
                    return this.service.regenerateOauthSecret(featureId, oauthConfigId).pipe(
                        tapResponse(
                            (res: BaseResponse<IOAuthConfig, void>) => {
                                if (res?.hasError) {
                                    this.showError(res?.errors);
                                } else {
                                    this.toast.success('Client secret regenerated');
                                }
                                this.patchState({
                                    isLoading: false,
                                    regenerateSecret: res?.hasError ? null : res?.data,
                                });
                            },
                            (error: any) => {
                                this.showError(error?.errors ?? error?.error?.errors);
                                this.patchState({ isLoading: false, regenerateSecret: null });
                            }
                        ),
                        catchError(() => EMPTY)
                    );
                })
            );
        }
    );

    readonly disableOauthConfig = this.effect(
        (data: Observable<{ featureId: string | number; oauthConfigId: string | number }>) => {
            return data.pipe(
                switchMap(({ featureId, oauthConfigId }) => {
                    this.patchState({ isLoading: true, disableOauthConfig: null });
                    return this.service.disableOauthConfig(featureId, oauthConfigId).pipe(
                        tapResponse(
                            (res: BaseResponse<IOAuthConfig, void>) => {
                                if (res?.hasError) {
                                    this.showError(res?.errors);
                                } else {
                                    this.toast.success('OAuth config disabled');
                                }
                                this.patchState({
                                    isLoading: false,
                                    disableOauthConfig: res?.hasError ? null : res?.data,
                                });
                            },
                            (error: any) => {
                                this.showError(error?.errors ?? error?.error?.errors);
                                this.patchState({ isLoading: false, disableOauthConfig: null });
                            }
                        ),
                        catchError(() => EMPTY)
                    );
                })
            );
        }
    );

    readonly getBlockScopes = this.effect((data: Observable<IOauthListParams>) => {
        return data.pipe(
            switchMap(({ featureId, itemsPerPage, pageNo, search }) => {
                this.patchState({ isLoading: true });
                const params: any = { itemsPerPage, pageNo };
                if (search?.trim()) {
                    params.search = search.trim();
                }
                return this.service.getBlockScopes(featureId, params).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IBlockScope[]>, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            }
                            this.patchState({
                                isLoading: false,
                                blockScopes: this.normalizePaginated<IBlockScope>(res?.data),
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors ?? error?.error?.errors);
                            this.patchState({
                                isLoading: false,
                                blockScopes: this.emptyPage<IBlockScope>(),
                            });
                        }
                    ),
                    catchError(() => EMPTY)
                );
            })
        );
    });

    /** Loads scopes for the OAuth allowed_scopes picker (large page, not table pagination). */
    readonly getBlockScopeCatalog = this.effect((data: Observable<string | number>) => {
        return data.pipe(
            switchMap((featureId) => {
                return this.service.getBlockScopes(featureId, { itemsPerPage: 100, pageNo: 1 }).pipe(
                    tapResponse(
                        (res: BaseResponse<IPaginatedResponse<IBlockScope[]>, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            }
                            const page = this.normalizePaginated<IBlockScope>(res?.data);
                            this.patchState({ blockScopeCatalog: page.data || [] });
                        },
                        (error: any) => {
                            this.showError(error?.errors ?? error?.error?.errors);
                            this.patchState({ blockScopeCatalog: [] });
                        }
                    ),
                    catchError(() => EMPTY)
                );
            })
        );
    });

    readonly createBlockScope = this.effect(
        (data: Observable<{ featureId: string | number; body: IBlockScopeCreatePayload }>) => {
            return data.pipe(
                switchMap(({ featureId, body }) => {
                    this.patchState({ isLoading: true, createBlockScope: null });
                    return this.service.createBlockScope(featureId, body).pipe(
                        tapResponse(
                            (res: BaseResponse<IBlockScope, void>) => {
                                if (res?.hasError) {
                                    this.showError(res?.errors);
                                } else {
                                    this.toast.success('Scope created successfully');
                                }
                                this.patchState({
                                    isLoading: false,
                                    createBlockScope: res?.hasError ? null : res?.data,
                                });
                            },
                            (error: any) => {
                                this.showError(error?.errors ?? error?.error?.errors);
                                this.patchState({ isLoading: false, createBlockScope: null });
                            }
                        ),
                        catchError(() => EMPTY)
                    );
                })
            );
        }
    );

    readonly updateBlockScope = this.effect(
        (
            data: Observable<{
                featureId: string | number;
                blockScopeId: string | number;
                body: IBlockScopeUpdatePayload;
            }>
        ) => {
            return data.pipe(
                switchMap(({ featureId, blockScopeId, body }) => {
                    this.patchState({ isLoading: true, updateBlockScope: null });
                    return this.service.updateBlockScope(featureId, blockScopeId, body).pipe(
                        tapResponse(
                            (res: BaseResponse<IBlockScope, void>) => {
                                if (res?.hasError) {
                                    this.showError(res?.errors);
                                } else {
                                    this.toast.success('Scope updated successfully');
                                }
                                this.patchState({
                                    isLoading: false,
                                    updateBlockScope: res?.hasError ? null : res?.data,
                                });
                            },
                            (error: any) => {
                                this.showError(error?.errors ?? error?.error?.errors);
                                this.patchState({ isLoading: false, updateBlockScope: null });
                            }
                        ),
                        catchError(() => EMPTY)
                    );
                })
            );
        }
    );

    readonly deleteBlockScope = this.effect(
        (data: Observable<{ featureId: string | number; blockScopeId: string | number }>) => {
            return data.pipe(
                switchMap(({ featureId, blockScopeId }) => {
                    this.patchState({ isLoading: true, deleteBlockScope: null });
                    return this.service.deleteBlockScope(featureId, blockScopeId).pipe(
                        tapResponse(
                            (res: BaseResponse<any, void>) => {
                                if (res?.hasError) {
                                    this.showError(res?.errors);
                                } else {
                                    this.toast.success('Scope deleted successfully');
                                }
                                this.patchState({
                                    isLoading: false,
                                    deleteBlockScope: res?.hasError ? null : (res?.data ?? true),
                                });
                            },
                            (error: any) => {
                                this.showError(error?.errors ?? error?.error?.errors);
                                this.patchState({ isLoading: false, deleteBlockScope: null });
                            }
                        ),
                        catchError(() => EMPTY)
                    );
                })
            );
        }
    );

    private showError(error): void {
        const errorMessage = errorResolver(error);
        errorMessage.forEach((msg) => {
            this.toast.error(msg);
        });
    }

    private normalizePaginated<T>(data: any): IPaginatedResponse<T[]> {
        if (Array.isArray(data)) {
            return {
                data,
                itemsPerPage: data.length || 25,
                pageNumber: 1,
                pageNo: 1,
                totalEntityCount: data.length,
                totalPageCount: 1,
            };
        }
        const rows = Array.isArray(data?.data) ? data.data : [];
        return {
            data: rows,
            itemsPerPage: data?.itemsPerPage ?? 25,
            pageNumber: data?.pageNumber ?? data?.pageNo ?? 1,
            pageNo: data?.pageNo ?? data?.pageNumber ?? 1,
            totalEntityCount: data?.totalEntityCount ?? rows.length,
            totalPageCount: data?.totalPageCount ?? 1,
        };
    }

    private emptyPage<T>(): IPaginatedResponse<T[]> {
        return {
            data: [],
            itemsPerPage: 25,
            pageNumber: 1,
            pageNo: 1,
            totalEntityCount: 0,
            totalPageCount: 0,
        };
    }
}
