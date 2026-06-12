import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { BaseComponent } from '@proxy/ui/base-component';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';
import { SkeletonDirective } from '@proxy/directives/skeleton';
import { BillingComponentStore } from './billing.store';
import { IBillingPaymentMethod, IBillingPlan, IBillingSubscriptionStatus, IBillingUsageMetric } from './billing.models';

export interface BillingPlanFeature {
    text: string;
    included: boolean;
    bold?: boolean;
}

export interface BillingInfoBanner {
    icon: string;
    title: string;
    description: string;
}

export interface BillingTrustItem {
    title: string;
    description: string;
    icon: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-billing',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, SkeletonDirective],
    providers: [BillingComponentStore],
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss'],
})
export class BillingComponent extends BaseComponent implements OnInit {
    @ViewChild('plansDialogTpl', { static: false }) plansDialogTpl!: TemplateRef<unknown>;

    private readonly componentStore = inject(BillingComponentStore);
    private readonly dialog = inject(MatDialog);
    private plansDialogRef: MatDialogRef<unknown> | null = null;
    public readonly metricRingRadius = 52;
    public readonly metricRingCircumference = 2 * Math.PI * 52;
    private readonly planTierOrder: Record<string, number> = {
        starter: 0,
        growth: 1,
        scale: 2,
    };

    public plans$: Observable<IBillingPlan[] | null> = this.componentStore.plans$;
    public subscriptionStatus$: Observable<IBillingSubscriptionStatus | null> = this.componentStore.subscriptionStatus$;
    public activePlan$: Observable<IBillingPlan | null> = this.componentStore.activePlan$;
    public subscriptionUsage$ = this.componentStore.subscriptionUsage$;
    public usageDashboardInProcess$: Observable<boolean> = this.componentStore.usageDashboardInProcess$;
    public plansInProcess$: Observable<boolean> = this.componentStore.plansInProcess$;
    public subscriptionStatusInProcess$: Observable<boolean> = this.componentStore.subscriptionStatusInProcess$;
    public upgradingPlanCode$: Observable<string | null> = this.componentStore.upgradingPlanCode$;
    public addingPaymentMethod$: Observable<boolean> = this.componentStore.addingPaymentMethod$;
    public paymentMethods$: Observable<IBillingPaymentMethod[]> = this.componentStore.paymentMethods$;
    public paymentMethodsInProcess$: Observable<boolean> = this.componentStore.paymentMethodsInProcess$;
    public settingDefaultPaymentMethodId$: Observable<string | null> =
        this.componentStore.settingDefaultPaymentMethodId$;

    ngOnInit(): void {
        this.componentStore.loadSubscriptionStatus();
        this.componentStore.loadPaymentMethods();
    }

    public openPlansDialog(): void {
        this.componentStore.getPlans();
        this.plansDialogRef = this.dialog.open(this.plansDialogTpl, {
            panelClass: ['mat-dialog', 'mat-dialog-lg', 'mat-high-dialog', 'billing-plans-dialog'],
            maxHeight: '90vh',
            autoFocus: false,
            restoreFocus: false,
        });
        this.plansDialogRef.afterClosed().subscribe(() => {
            this.plansDialogRef = null;
        });
    }

    public closePlansDialog(): void {
        this.plansDialogRef?.close();
    }

    public onAddPaymentMethodClick(): void {
        this.componentStore.addPaymentMethod();
    }

    public onSetDefaultPaymentMethodClick(paymentMethod: IBillingPaymentMethod): void {
        if (paymentMethod.is_default) {
            return;
        }

        this.componentStore.setDefaultPaymentMethod(paymentMethod.id);
    }

    public isSettingDefaultPaymentMethod(
        paymentMethod: IBillingPaymentMethod,
        settingDefaultPaymentMethodId: string | null
    ): boolean {
        return settingDefaultPaymentMethodId === paymentMethod.id;
    }

    public getPaymentMethodBrand(paymentMethod: IBillingPaymentMethod): string {
        const brand = paymentMethod.card?.display_brand || paymentMethod.card?.brand || paymentMethod.type;
        return brand.charAt(0).toUpperCase() + brand.slice(1);
    }

    public getPaymentMethodLabel(paymentMethod: IBillingPaymentMethod): string {
        const brand = this.getPaymentMethodBrand(paymentMethod);
        const last4 = paymentMethod.card?.last4 ? ` •••• ${paymentMethod.card.last4}` : '';
        return `${brand}${last4}`;
    }

    public getPaymentMethodExpiry(paymentMethod: IBillingPaymentMethod): string | null {
        const { exp_month: month, exp_year: year } = paymentMethod.card ?? {};
        if (!month || !year) {
            return null;
        }

        return `Expires ${month}/${year}`;
    }

    public getPaymentMethodEmail(paymentMethod: IBillingPaymentMethod): string | null {
        return paymentMethod.billing_details?.email?.trim() || null;
    }

    public isActivePlan(plan: IBillingPlan, subscriptionStatus: IBillingSubscriptionStatus | null): boolean {
        return (
            !!subscriptionStatus?.has_subscription &&
            subscriptionStatus.status === 'active' &&
            subscriptionStatus.active_plan_code === plan.lago_plan_code
        );
    }

    public getDisplayName(plan: IBillingPlan): string {
        return plan.frontend_data?.display_name || plan.name;
    }

    public getTagline(plan: IBillingPlan): string | null {
        return plan.frontend_data?.tagline || null;
    }

    public getBadge(plan: IBillingPlan, subscriptionStatus: IBillingSubscriptionStatus | null): string | null {
        if (this.isActivePlan(plan, subscriptionStatus)) {
            return 'Current Plan';
        }
        return plan.frontend_data?.badge ?? null;
    }

    public getPriceAmount(plan: IBillingPlan): string | null {
        const price = plan.frontend_data?.price;
        if (!price) {
            return null;
        }

        if (price.amount !== undefined && price.amount !== null) {
            const symbol = price.currency === 'USD' ? '$' : price.currency ? `${price.currency} ` : '';
            return `${symbol}${price.amount}`;
        }

        if (price.display) {
            const slashIndex = price.display.indexOf('/');
            return slashIndex > -1 ? price.display.slice(0, slashIndex).trim() : price.display.trim();
        }

        return null;
    }

    public getPricePeriod(plan: IBillingPlan): string {
        const price = plan.frontend_data?.price;
        if (price?.interval) {
            return `/ ${price.interval}`;
        }
        if (price?.display?.includes('/')) {
            return price.display.slice(price.display.indexOf('/')).trim();
        }
        return '/ month';
    }

    public getPlanFeatures(plan: IBillingPlan): BillingPlanFeature[] {
        return (plan.frontend_data?.features ?? []).map((text) => ({
            text,
            included: !/not available|not included/i.test(text),
            bold: /extra usage|^\+\$/i.test(text),
        }));
    }

    public isHigherPlan(plan: IBillingPlan, subscriptionStatus: IBillingSubscriptionStatus | null): boolean {
        if (!subscriptionStatus?.has_subscription || !subscriptionStatus.active_plan_code) {
            return false;
        }

        const activeTier = this.planTierOrder[subscriptionStatus.active_plan_code];
        const planTier = this.planTierOrder[plan.lago_plan_code];

        if (activeTier === undefined || planTier === undefined) {
            return false;
        }

        return planTier > activeTier;
    }

    public isUpgrading(plan: IBillingPlan, upgradingPlanCode: string | null): boolean {
        return upgradingPlanCode === plan.lago_plan_code;
    }

    public onPlanCtaClick(plan: IBillingPlan, subscriptionStatus: IBillingSubscriptionStatus | null): void {
        if (this.isActivePlan(plan, subscriptionStatus) || !this.isHigherPlan(plan, subscriptionStatus)) {
            return;
        }

        const planName = this.getDisplayName(plan);
        const confirmDialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
            panelClass: ['mat-dialog'],
        });
        confirmDialogRef.componentRef.setInput(
            'confirmationMessage',
            `Are you sure you want to upgrade to ${planName}?`
        );
        confirmDialogRef.componentRef.setInput('confirmButtonText', 'Upgrade');
        confirmDialogRef.componentRef.setInput('confirmButtonColor', 'primary');

        confirmDialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                this.componentStore.upgradeSubscription(plan.lago_plan_code);
            }
        });
    }

    public getSubscriptionStatusLabel(status: IBillingSubscriptionStatus | null): string {
        if (!status?.has_subscription) {
            return 'No plan';
        }

        return status.status.charAt(0).toUpperCase() + status.status.slice(1);
    }

    public formatUsageDate(value: string | null | undefined): string | null {
        if (!value) {
            return null;
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    public getBillingPeriodLabel(
        subscriptionStatus: IBillingSubscriptionStatus | null,
        periodFrom: string | null | undefined,
        periodTo: string | null | undefined
    ): string | null {
        const from = this.formatUsageDate(periodFrom ?? subscriptionStatus?.started_at);
        if (!from) {
            return null;
        }

        const to = periodTo ? this.formatUsageDate(periodTo) : 'Present';
        return `${from} – ${to}`;
    }

    public getMetricIcon(code: string): string {
        switch (code) {
            case 'monthly_active_users':
                return 'groups';
            case 'blocks':
                return 'view_module';
            default:
                return 'insights';
        }
    }

    public formatUsageValue(value: number): string {
        return new Intl.NumberFormat().format(value);
    }

    public getMetricLimitLabel(metric: IBillingUsageMetric): string {
        if (metric.is_unlimited) {
            return 'Unlimited';
        }

        if (metric.limit_display) {
            return metric.limit_display;
        }

        if (metric.limit !== null && metric.limit !== undefined) {
            return this.formatUsageValue(metric.limit);
        }

        return '—';
    }

    public getMetricPercent(metric: IBillingUsageMetric): number {
        if (metric.is_unlimited) {
            return 0;
        }

        if (metric.percent_used !== null && metric.percent_used !== undefined) {
            return Math.min(100, Math.max(0, metric.percent_used));
        }

        if (metric.limit) {
            return Math.min(100, Math.max(0, (metric.current_usage / metric.limit) * 100));
        }

        return 0;
    }

    public getMetricPercentLabel(metric: IBillingUsageMetric): string {
        if (metric.is_unlimited) {
            return 'Unlimited';
        }

        return `${Math.round(this.getMetricPercent(metric))}% used`;
    }

    public getMetricTone(metric: IBillingUsageMetric): 'healthy' | 'warning' | 'critical' | 'unlimited' {
        if (metric.is_unlimited) {
            return 'unlimited';
        }

        const percent = this.getMetricPercent(metric);
        if (percent >= 90) {
            return 'critical';
        }

        if (percent >= 70) {
            return 'warning';
        }

        return 'healthy';
    }

    public getMetricRingOffset(metric: IBillingUsageMetric): number {
        if (metric.is_unlimited) {
            return this.metricRingCircumference * 0.15;
        }

        return this.metricRingCircumference * (1 - this.getMetricPercent(metric) / 100);
    }

    public getMetricRingPercentDisplay(metric: IBillingUsageMetric): string {
        if (metric.is_unlimited) {
            return '∞';
        }

        return `${Math.round(this.getMetricPercent(metric))}%`;
    }

    public getMetricRemainingLabel(metric: IBillingUsageMetric): string {
        if (metric.is_unlimited) {
            return 'No limit';
        }

        if (metric.limit === null || metric.limit === undefined) {
            return '—';
        }

        const remaining = Math.max(0, metric.limit - metric.current_usage);
        return `${this.formatUsageValue(remaining)} left`;
    }

    public getCtaLabel(plan: IBillingPlan, subscriptionStatus: IBillingSubscriptionStatus | null): string {
        if (this.isActivePlan(plan, subscriptionStatus)) {
            return 'Subscribed';
        }

        if (this.isHigherPlan(plan, subscriptionStatus)) {
            return `Upgrade to ${this.getDisplayName(plan)}`;
        }

        if (plan.frontend_data?.cta) {
            return plan.frontend_data.cta;
        }

        switch (plan.lago_plan_code) {
            case 'starter':
                return 'Start Free';
            case 'growth':
                return 'Upgrade to Growth';
            case 'scale':
                return 'Choose Scale';
            default:
                return `Choose ${this.getDisplayName(plan)}`;
        }
    }
}
