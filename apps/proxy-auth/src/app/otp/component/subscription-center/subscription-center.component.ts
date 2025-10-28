import { Component, Input, OnInit, Output, EventEmitter, Inject, Optional } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../../store/app.state';
import { BaseComponent } from '@proxy/ui/base-component';
import { distinctUntilChanged, Observable, takeUntil } from 'rxjs';
import { isEqual } from 'lodash';
import { subscriptionPlansData } from '../../store/selectors';
import { getSubscriptionPlans } from '../../store/actions/otp.action';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SubscriptionPlan {
    id: string;
    title: string;
    price: string;
    priceValue: number;
    currency: string;
    period: string;
    buttonText: string;
    buttonStyle: string;
    isPopular?: boolean;
    isSelected?: boolean;
    features?: string[];
    notIncludedFeatures?: string[];
    metrics?: string[];
    extraFeatures?: string[];
    status?: string;
    subscribeButtonLink?: string;
    subscribeButtonHidden?: boolean;
}

@Component({
    selector: 'proxy-subscription-center',
    templateUrl: './subscription-center.component.html',
    styleUrls: ['./subscription-center.component.scss'],
})
export class SubscriptionCenterComponent extends BaseComponent implements OnInit {
    @Input() public referenceId: string;
    @Output() public closeEvent = new EventEmitter<boolean>();
    @Output() public planSelected = new EventEmitter<SubscriptionPlan>();
    @Input() public isPreview: boolean = false;
    @Output() public togglePopUp: EventEmitter<any> = new EventEmitter();
    @Input() public isLogin: boolean;
    @Input() public loginRedirectUrl: string;

    public subscriptionPlans$: Observable<any>;
    public subscriptionPlans: any[] = [];

    constructor(
        private store: Store<IAppState>,
        @Optional() public dialogRef: MatDialogRef<SubscriptionCenterComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any
    ) {
        super();

        this.subscriptionPlans$ = this.store.pipe(
            select(subscriptionPlansData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.subscriptionPlans$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
            if (res && res.data && Array.isArray(res.data)) {
                this.subscriptionPlans = this.formatSubscriptionPlans(res.data);
            } else {
                this.subscriptionPlans = [];
            }
        });
    }

    private formatSubscriptionPlans(plans: any[]): any[] {
        return plans.map((plan, index) => ({
            id: plan.planName?.toLowerCase().replace(/\s+/g, '-') || `plan-${index}`,
            title: plan.plan_name || 'Unnamed Plan',
            price: plan.plan_price || 'Free',
            priceValue: this.extractPriceValue(plan.plan_price),
            currency: this.extractCurrency(plan.plan_price),
            period: 'per month',
            buttonText: this.isLogin ? 'Upgrade' : 'Get Started',
            buttonStyle: 'primary',
            isPopular: plan.PlanMeta?.highlight_plan || false,
            tag: plan.plan_meta?.tag || '',
            isSelected: false,
            features: plan.plan_meta?.features?.included || [],
            notIncludedFeatures: plan.plan_meta?.features?.notIncluded || [],
            metrics: plan.plan_meta?.metrics || [],
            extraFeatures: plan.plan_meta?.extra || [],
            status: 'active',
            subscribeButtonLink: this.isLogin
                ? plan.subscribe_button_link?.replace('{ref_id}', this.referenceId)
                : this.loginRedirectUrl,
            subscribeButtonHidden: false,
        }));
    }

    private extractPriceValue(priceString: string): number {
        if (!priceString) return 0;
        const match = priceString.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }

    private extractCurrency(priceString: string): string {
        if (!priceString) return '';
        const match = priceString.match(/[A-Z]{3}/);
        return match ? match[0] : '';
    }

    private formatCharges(charges: any[]): string[] {
        if (!charges || !Array.isArray(charges)) return [];
        return charges.map((charge) => {
            const quota = charge.quotas || '';
            const metricName = charge.billable_metric_name || '';
            return `${quota} ${metricName}`.trim();
        });
    }

    private getIncludedFeatures(charges: any[]): string[] {
        if (!charges || !Array.isArray(charges)) return [];
        return charges.map((charge) => {
            const quota = charge.quotas || '';
            const metricName = charge.billable_metric_name || '';
            return `${quota} ${metricName}`.trim();
        });
    }

    public close(value: boolean): void {
        this.closeEvent.emit(value);
        this.togglePopUp.emit();

        if (this.dialogRef) {
            this.dialogRef.close(value);
        }
    }

    public selectPlan(plan: SubscriptionPlan): void {
        // Update selection state
        this.subscriptionPlans.forEach((p) => (p.isSelected = false));
        plan.isSelected = true;

        // Emit selected plan
        this.planSelected.emit(plan);

        // Navigate to subscribe button link if available
        if (plan.subscribeButtonLink) {
            window.open(plan.subscribeButtonLink, '_blank');
        }
    }
}
