import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { FeaturesService } from '@proxy/services/proxy/features';
import { IClientSecret, IClientSecretCreatePayload } from '@proxy/models/features-model';
import { BaseResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';

export interface IClientSecretsState {
    secrets: IClientSecret[];
    /** True once the list has been fetched successfully at least once. */
    loaded: boolean;
    /** True while the list is being fetched. */
    isLoading: boolean;
    /** Set when the list could not be fetched, so the UI can offer a retry. */
    loadFailed: boolean;
    isCreating: boolean;
    /** Id of the secret currently being revoked, if any. */
    revokingId: number | null;
    /** The secret just created. Holds the one-time plaintext, cleared by the component once shown. */
    createdSecret: IClientSecret | null;
}

@Injectable()
export class ClientSecretsComponentStore extends ComponentStore<IClientSecretsState> {
    constructor(
        private service: FeaturesService,
        private toast: PrimeNgToastService
    ) {
        super({
            secrets: [],
            loaded: false,
            isLoading: false,
            loadFailed: false,
            isCreating: false,
            revokingId: null,
            createdSecret: null,
        });
    }

    readonly secrets$ = this.select((state) => state.secrets);
    /** Number of active (not revoked) secrets, or null until the list has loaded (so 0 is never a guess). */
    readonly activeCount$ = this.select((state) =>
        state.loaded ? state.secrets.filter((secret) => !secret.revoked_at).length : null
    );
    readonly isLoading$ = this.select((state) => state.isLoading);
    readonly loadFailed$ = this.select((state) => state.loadFailed);
    readonly isCreating$ = this.select((state) => state.isCreating);
    readonly revokingId$ = this.select((state) => state.revokingId);
    readonly createdSecret$ = this.select((state) => state.createdSecret);

    readonly getSecrets = this.effect((featureId$: Observable<string | number>) => {
        return featureId$.pipe(
            switchMap((featureId) => {
                this.patchState({ isLoading: true, loadFailed: false });
                return this.service.getClientSecrets(featureId).pipe(
                    tapResponse(
                        (res: BaseResponse<IClientSecret[], void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                                this.patchState({ isLoading: false, loadFailed: true });
                                return;
                            }
                            this.patchState({
                                isLoading: false,
                                loaded: true,
                                secrets: Array.isArray(res?.data) ? res.data : [],
                            });
                        },
                        (error: any) => {
                            this.showError(error?.errors ?? error?.error?.errors);
                            this.patchState({ isLoading: false, loadFailed: true });
                        }
                    ),
                    catchError(() => EMPTY)
                );
            })
        );
    });

    readonly createSecret = this.effect(
        (data$: Observable<{ featureId: string | number; body: IClientSecretCreatePayload }>) => {
            return data$.pipe(
                switchMap(({ featureId, body }) => {
                    this.patchState({ isCreating: true, createdSecret: null });
                    return this.service.createClientSecret(featureId, body).pipe(
                        tapResponse(
                            (res: BaseResponse<IClientSecret, void>) => {
                                if (res?.hasError) {
                                    this.showError(res?.errors);
                                    this.patchState({ isCreating: false });
                                    return;
                                }
                                this.patchState({ isCreating: false, createdSecret: res?.data });
                                this.getSecrets(featureId);
                            },
                            (error: any) => {
                                this.showError(error?.errors ?? error?.error?.errors);
                                this.patchState({ isCreating: false });
                                // e.g. the limit was hit from another tab: make the list reflect reality
                                this.getSecrets(featureId);
                            }
                        ),
                        catchError(() => EMPTY)
                    );
                })
            );
        }
    );

    readonly revokeSecret = this.effect((data$: Observable<{ featureId: string | number; secretId: number }>) => {
        return data$.pipe(
            switchMap(({ featureId, secretId }) => {
                this.patchState({ revokingId: secretId });
                return this.service.revokeClientSecret(featureId, secretId).pipe(
                    tapResponse(
                        (res: BaseResponse<IClientSecret, void>) => {
                            if (res?.hasError) {
                                this.showError(res?.errors);
                            } else {
                                this.toast.success('Client secret revoked');
                            }
                            this.patchState({ revokingId: null });
                            this.getSecrets(featureId);
                        },
                        (error: any) => {
                            this.showError(error?.errors ?? error?.error?.errors);
                            this.patchState({ revokingId: null });
                        }
                    ),
                    catchError(() => EMPTY)
                );
            })
        );
    });

    /** Drop the one-time plaintext from memory once the user has seen it. */
    clearCreatedSecret(): void {
        this.patchState({ createdSecret: null });
    }

    private showError(error): void {
        errorResolver(error).forEach((msg) => this.toast.error(msg));
    }
}
