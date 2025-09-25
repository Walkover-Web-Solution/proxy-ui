import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../../store/app.state';
import { BaseComponent } from '@proxy/ui/base-component';
import { distinctUntilChanged, Observable, takeUntil } from 'rxjs';
import { isEqual } from 'lodash';
import { subscriptionPlansData } from '../../store/selectors';
import { getSubscriptionPlans } from '../../store/actions/otp.action';

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

    public subscriptionPlans$: Observable<any>;

    public subscriptionPlans: any[] = [];

    constructor(private store: Store<IAppState>) {
        super();

        this.subscriptionPlans$ = this.store.pipe(
            select(subscriptionPlansData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
    }

    ngOnInit(): void {
        this.store.dispatch(getSubscriptionPlans({ referenceId: this.referenceId }));
        this.subscriptionPlans$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            if (data) {
                this.subscriptionPlans = this.formatSubscriptionPlans(data.data);
            }
        });
    }

    private formatSubscriptionPlans(plans: any[]): any[] {
        return plans.map((plan, index) => ({
            id: plan.plan_name?.toLowerCase().replace(/\s+/g, '-') || `plan-${index}`,
            title: plan.plan_name || 'Unnamed Plan',
            price: plan.plan_price || 'Free',
            priceValue: this.extractPriceValue(plan.plan_price),
            currency: this.extractCurrency(plan.plan_price),
            buttonText: plan.subscribe_button_hidden ? 'Hidden' : 'Get Started',
            buttonStyle: 'secondary', // All plans use secondary style
            isPopular: false, // No plan is popular by default
            isSelected: false, // No plan is selected by default
            features: this.getIncludedFeatures(plan.charges),
            status: plan.plan_status,
            subscribeButtonLink: plan.subscribe_button_link,
            subscribeButtonHidden: plan.subscribe_button_hidden,
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
    }

    public selectPlan(plan: SubscriptionPlan): void {
        // Update selection state
        this.subscriptionPlans.forEach((p) => (p.isSelected = false));
        plan.isSelected = true;

        // Emit selected plan
        this.planSelected.emit(plan);
    }
}
