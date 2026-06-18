import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { BaseResponse, errorResolver } from '@proxy/models/root-models';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { EMPTY, Observable, catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { BillingService } from './billing.service';
import {
    IBillingCheckoutResponse,
    IBillingPaymentMethod,
    IBillingPlan,
    IBillingSubscriptionStatus,
    IBillingSubscriptionUsage,
} from './billing.models';

export interface IBillingInitialState {
    plans: IBillingPlan[] | null;
    subscriptionStatus: IBillingSubscriptionStatus | null;
    activePlan: IBillingPlan | null;
    subscriptionUsage: IBillingSubscriptionUsage | null;
    paymentMethods: IBillingPaymentMethod[];
    plansInProcess: boolean;
    subscriptionStatusInProcess: boolean;
    activePlanInProcess: boolean;
    usageInProcess: boolean;
    paymentMethodsInProcess: boolean;
    customerBootstrapAttempted: boolean;
    upgradingPlanCode: string | null;
    addingPaymentMethod: boolean;
    settingDefaultPaymentMethodId: string | null;
}

@Injectable()
export class BillingComponentStore extends ComponentStore<IBillingInitialState> {
    constructor(
        private service: BillingService,
        private toast: PrimeNgToastService
    ) {
        super({
            plans: null,
            subscriptionStatus: null,
            activePlan: null,
            subscriptionUsage: null,
            paymentMethods: [],
            plansInProcess: false,
            subscriptionStatusInProcess: false,
            activePlanInProcess: false,
            usageInProcess: false,
            paymentMethodsInProcess: false,
            customerBootstrapAttempted: false,
            upgradingPlanCode: null,
            addingPaymentMethod: false,
            settingDefaultPaymentMethodId: null,
        });
    }

    readonly plans$: Observable<IBillingPlan[] | null> = this.select((state) => state.plans);
    readonly subscriptionStatus$: Observable<IBillingSubscriptionStatus | null> = this.select(
        (state) => state.subscriptionStatus
    );
    readonly activePlan$: Observable<IBillingPlan | null> = this.select((state) => state.activePlan);
    readonly subscriptionUsage$: Observable<IBillingSubscriptionUsage | null> = this.select(
        (state) => state.subscriptionUsage
    );
    readonly plansInProcess$: Observable<boolean> = this.select((state) => state.plansInProcess);
    readonly activePlanInProcess$: Observable<boolean> = this.select((state) => state.activePlanInProcess);
    readonly usageInProcess$: Observable<boolean> = this.select((state) => state.usageInProcess);
    readonly usageDashboardInProcess$: Observable<boolean> = this.select(
        (state) => state.subscriptionStatusInProcess || state.activePlanInProcess || state.usageInProcess
    );
    readonly subscriptionStatusInProcess$: Observable<boolean> = this.select(
        (state) => state.subscriptionStatusInProcess
    );
    readonly isLoading$: Observable<boolean> = this.select(
        (state) => state.plansInProcess || state.subscriptionStatusInProcess
    );
    readonly upgradingPlanCode$: Observable<string | null> = this.select((state) => state.upgradingPlanCode);
    readonly addingPaymentMethod$: Observable<boolean> = this.select((state) => state.addingPaymentMethod);
    readonly paymentMethods$: Observable<IBillingPaymentMethod[]> = this.select((state) => state.paymentMethods);
    readonly paymentMethodsInProcess$: Observable<boolean> = this.select((state) => state.paymentMethodsInProcess);
    readonly settingDefaultPaymentMethodId$: Observable<string | null> = this.select(
        (state) => state.settingDefaultPaymentMethodId
    );

    readonly getPlans = this.effect((trigger$: Observable<void>) => {
        return trigger$.pipe(
            switchMap(() => {
                this.patchState({ plansInProcess: true });
                return this.service.getPlans().pipe(
                    tapResponse(
                        (res: BaseResponse<IBillingPlan[], void>) => {
                            if (res?.hasError) {
                                this.showErrorMessages(res.errors);
                            }
                            const plans = Array.isArray(res?.data) ? res.data : [];
                            this.patchState({
                                plansInProcess: false,
                                plans,
                            });
                        },
                        (error: any) => {
                            this.showErrorMessages(error?.errors);
                            this.patchState({
                                plansInProcess: false,
                                plans: null,
                            });
                        }
                    ),
                    catchError(() => EMPTY)
                );
            })
        );
    });

    readonly loadSubscriptionStatus = this.effect((trigger$: Observable<void>) => {
        return trigger$.pipe(
            exhaustMap(() => {
                this.patchState({ subscriptionStatusInProcess: true });
                return this.fetchSubscriptionStatus().pipe(
                    switchMap((status) => {
                        if (status?.has_subscription || this.get().customerBootstrapAttempted) {
                            return of(status);
                        }

                        this.patchState({ customerBootstrapAttempted: true });
                        return this.service.createCustomer().pipe(
                            switchMap((customerRes) => {
                                if (customerRes?.hasError) {
                                    this.showErrorMessages(customerRes.errors);
                                    return of(status);
                                }
                                return this.fetchSubscriptionStatus();
                            }),
                            catchError((error: any) => {
                                this.showErrorMessages(error?.errors);
                                return of(status);
                            })
                        );
                    }),
                    tap((status) => {
                        this.patchState({
                            subscriptionStatusInProcess: false,
                            subscriptionStatus: status,
                        });

                        if (status?.has_subscription && status.active_plan_code) {
                            this.loadActivePlan(status.active_plan_code);
                            this.loadSubscriptionUsage();
                        } else {
                            this.patchState({
                                activePlan: null,
                                subscriptionUsage: null,
                                activePlanInProcess: false,
                                usageInProcess: false,
                            });
                        }
                    }),
                    catchError((error: any) => {
                        this.showErrorMessages(error?.errors);
                        this.patchState({
                            subscriptionStatusInProcess: false,
                            subscriptionStatus: null,
                        });
                        return EMPTY;
                    })
                );
            })
        );
    });

    readonly loadActivePlan = this.effect((planCode$: Observable<string>) => {
        return planCode$.pipe(
            exhaustMap((planCode) => {
                this.patchState({ activePlanInProcess: true });
                return this.service.getPlanByCode(planCode).pipe(
                    tapResponse(
                        (res: BaseResponse<IBillingPlan, void>) => {
                            if (res?.hasError) {
                                this.showErrorMessages(res.errors);
                            }
                            const plan = res?.data ?? null;
                            this.patchState({
                                activePlanInProcess: false,
                                activePlan: plan,
                            });
                        },
                        (error: any) => {
                            this.showErrorMessages(error?.errors);
                            this.patchState({
                                activePlanInProcess: false,
                                activePlan: null,
                            });
                        }
                    ),
                    catchError(() => EMPTY)
                );
            })
        );
    });

    readonly loadSubscriptionUsage = this.effect((trigger$: Observable<void>) => {
        return trigger$.pipe(
            exhaustMap(() => {
                this.patchState({ usageInProcess: true });
                return this.service.getSubscriptionUsage().pipe(
                    tapResponse(
                        (res: BaseResponse<IBillingSubscriptionUsage, void>) => {
                            if (res?.hasError) {
                                this.showErrorMessages(res.errors);
                            }
                            this.patchState({
                                usageInProcess: false,
                                subscriptionUsage: res?.data ?? null,
                            });
                        },
                        (error: any) => {
                            this.showErrorMessages(error?.errors);
                            this.patchState({
                                usageInProcess: false,
                                subscriptionUsage: null,
                            });
                        }
                    ),
                    catchError(() => EMPTY)
                );
            })
        );
    });

    readonly loadPaymentMethods = this.effect((trigger$: Observable<void>) => {
        return trigger$.pipe(
            switchMap(() => {
                this.patchState({ paymentMethodsInProcess: true });
                return this.fetchPaymentMethods().pipe(
                    tap((paymentMethods) => {
                        this.patchState({
                            paymentMethodsInProcess: false,
                            paymentMethods,
                        });
                    }),
                    catchError((error: any) => {
                        this.showErrorMessages(error?.errors);
                        this.patchState({
                            paymentMethodsInProcess: false,
                            paymentMethods: [],
                        });
                        return EMPTY;
                    })
                );
            })
        );
    });

    readonly setDefaultPaymentMethod = this.effect((paymentMethodId$: Observable<string>) => {
        return paymentMethodId$.pipe(
            exhaustMap((paymentMethodId) => {
                this.patchState({ settingDefaultPaymentMethodId: paymentMethodId });
                return this.service.setDefaultPaymentMethod({ payment_method_id: paymentMethodId }).pipe(
                    switchMap((res) => {
                        if (res?.hasError) {
                            this.showErrorMessages(res.errors);
                            this.patchState({ settingDefaultPaymentMethodId: null });
                            return EMPTY;
                        }

                        return this.fetchPaymentMethods().pipe(
                            tap((paymentMethods) => {
                                this.patchState({
                                    settingDefaultPaymentMethodId: null,
                                    paymentMethods,
                                });
                            }),
                            catchError((error: any) => {
                                this.patchState({ settingDefaultPaymentMethodId: null });
                                this.showErrorMessages(error?.errors);
                                return EMPTY;
                            })
                        );
                    }),
                    catchError((error: any) => {
                        this.patchState({ settingDefaultPaymentMethodId: null });
                        this.showErrorMessages(error?.errors);
                        return EMPTY;
                    })
                );
            })
        );
    });

    readonly addPaymentMethod = this.effect((trigger$: Observable<void>) => {
        return trigger$.pipe(
            exhaustMap(() => {
                this.patchState({ addingPaymentMethod: true });
                return this.service.addPaymentMethod().pipe(
                    tapResponse(
                        (res) => {
                            if (res?.hasError) {
                                this.showErrorMessages(res.errors);
                                this.patchState({ addingPaymentMethod: false });
                                return;
                            }

                            const checkoutUrl = this.resolveCheckoutUrl(res?.data);
                            if (checkoutUrl) {
                                window.location.href = checkoutUrl;
                                return;
                            }

                            this.patchState({ addingPaymentMethod: false });
                            this.toast.error('Checkout URL not available.');
                        },
                        (error: any) => {
                            this.patchState({ addingPaymentMethod: false });
                            this.showErrorMessages(error?.errors);
                        }
                    ),
                    catchError(() => EMPTY)
                );
            })
        );
    });

    readonly upgradeSubscription = this.effect((planCode$: Observable<string>) => {
        return planCode$.pipe(
            exhaustMap((planCode) => {
                this.patchState({ upgradingPlanCode: planCode });
                return this.service.upgradeSubscription({ plan_code: planCode }).pipe(
                    switchMap((res) => {
                        if (res?.hasError) {
                            this.showErrorMessages(res.errors);
                            this.patchState({ upgradingPlanCode: null });
                            return EMPTY;
                        }

                        const data = res?.data;
                        if (data?.requires_payment_method) {
                            const checkoutUrl = this.resolveCheckoutUrl(data);
                            if (checkoutUrl) {
                                window.location.href = checkoutUrl;
                                return EMPTY;
                            }

                            this.patchState({ upgradingPlanCode: null });
                            this.toast.error('Checkout URL not available.');
                            return EMPTY;
                        }

                        return this.fetchSubscriptionStatus().pipe(
                            tap((status) => {
                                this.patchState({
                                    upgradingPlanCode: null,
                                    subscriptionStatus: status,
                                });

                                if (status?.has_subscription && status.active_plan_code) {
                                    this.loadActivePlan(status.active_plan_code);
                                    this.loadSubscriptionUsage();
                                } else {
                                    this.patchState({
                                        activePlan: null,
                                        subscriptionUsage: null,
                                    });
                                }
                            }),
                            catchError((error: any) => {
                                this.patchState({ upgradingPlanCode: null });
                                this.showErrorMessages(error?.errors);
                                return EMPTY;
                            })
                        );
                    }),
                    catchError((error: any) => {
                        this.patchState({ upgradingPlanCode: null });
                        this.showErrorMessages(error?.errors);
                        return EMPTY;
                    })
                );
            })
        );
    });

    private resolveCheckoutUrl(data: IBillingCheckoutResponse | null | undefined): string | null {
        if (!data) {
            return null;
        }

        return data.checkout_url ?? data.raw?.customer?.checkout_url ?? null;
    }

    private fetchPaymentMethods(): Observable<IBillingPaymentMethod[]> {
        return this.service.getPaymentMethods().pipe(
            map((res) => {
                if (res?.hasError) {
                    this.showErrorMessages(res.errors);
                }

                const methods = Array.isArray(res?.data?.payment_methods) ? res.data.payment_methods : [];
                return [...methods].sort((a, b) => Number(b.is_default) - Number(a.is_default));
            })
        );
    }

    private fetchSubscriptionStatus(): Observable<IBillingSubscriptionStatus | null> {
        return this.service.getSubscriptionStatus().pipe(
            map((res: BaseResponse<IBillingSubscriptionStatus, void>) => {
                if (res?.hasError) {
                    this.showErrorMessages(res.errors);
                }
                return res?.data ?? null;
            })
        );
    }

    private showErrorMessages(error: any): void {
        errorResolver(error).forEach((message) => this.toast.error(message));
    }
}
