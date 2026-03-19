import { Injectable } from '@angular/core';
import { PublicScriptTheme } from '@proxy/constant';

@Injectable({ providedIn: 'root' })
export class SubscriptionRendererService {
    // ─── Plan data helpers ────────────────────────────────────────────────────

    formatPlans(plans: any[], isLogin: boolean, referenceId: string, loginRedirectUrl: string): any[] {
        return plans.map((plan, index) => ({
            id: plan.plan_name?.toLowerCase().replace(/\s+/g, '-') || `plan-${index}`,
            title: plan.plan_name || 'Unnamed Plan',
            priceNumber: this.extractPriceValue(plan.plan_price) || 0,
            priceText:
                this.extractCurrency(plan.plan_price) ||
                (plan.plan_price ? plan.plan_price.replace(/[\d.]/g, '').trim() : 'Free'),
            priceValue: this.extractPriceValue(plan.plan_price),
            currency: this.extractCurrency(plan.plan_price),
            buttonText: plan.subscribe_button_hidden ? 'Hidden' : 'Get Started',
            buttonStyle: 'secondary',
            isPopular: false,
            isSelected: false,
            features: this.getIncludedFeatures(plan.charges),
            status: plan.plan_status,
            subscribeButtonLink: isLogin
                ? plan.subscribe_button_link?.replace('{ref_id}', referenceId)
                : loginRedirectUrl,
            subscribeButtonHidden: plan.subscribe_button_hidden,
        }));
    }

    extractPriceValue(priceString: string): number {
        if (!priceString) return 0;
        const match = priceString.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }

    extractCurrency(priceString: string): string {
        if (!priceString) return '';
        const match = priceString.match(/[A-Z]{3}/);
        return match ? match[0] : '';
    }

    getIncludedFeatures(charges: any[]): string[] {
        if (!charges || !Array.isArray(charges)) return [];
        return charges.map((c) => `${c.quotas || ''} ${c.billable_metric_name || ''}`.trim());
    }

    // ─── Styles injection ─────────────────────────────────────────────────────

    injectSubscriptionStyles(theme: string): void {
        if (document.getElementById('subscription-styles')) return;
        const isDark = theme === PublicScriptTheme.Dark;
        const style = document.createElement('style');
        style.id = 'subscription-styles';
        style.textContent = this.buildSubscriptionCSS(isDark);
        document.head.appendChild(style);
    }

    private buildSubscriptionCSS(isDark: boolean): string {
        return `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
            .position-relative{position:relative!important}
            .d-flex{display:flex!important}
            .d-block{display:block!important}
            .flex-row{flex-direction:row!important}
            .flex-column{flex-direction:column!important}
            .align-items-center{align-items:center!important}
            .align-items-stretch{align-items:stretch!important}
            .justify-content-start{justify-content:flex-start!important}
            .w-100{width:100%!important}
            .p-0{padding:0!important}
            .py-3{padding-top:1rem!important;padding-bottom:1rem!important}
            .m-0{margin:0!important}
            .mt-0{margin-top:0!important}
            .mb-2{margin-bottom:.5rem!important}
            .mb-3{margin-bottom:1rem!important}
            .mb-4{margin-bottom:1.5rem!important}
            .my-3{margin-top:1rem!important;margin-bottom:1rem!important}
            .text-left{text-align:left!important}
            .gap-2{gap:.5rem!important}
            .gap-3{gap:1rem!important}
            .gap-4{gap:1.5rem!important}

            .subscription-plans-container{flex:1;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;padding:20px;font-family:'Outfit',sans-serif}
            .plans-grid{gap:20px;max-width:100%;margin:0;align-items:flex-start;padding:20px 0 0 20px;overflow-x:auto;overflow-y:visible}
            .plans-grid::-webkit-scrollbar{height:8px}
            .plans-grid::-webkit-scrollbar-track{background:#f1f1f1;border-radius:4px}
            .plans-grid::-webkit-scrollbar-thumb{background:#c1c1c1;border-radius:4px}
            @media(max-width:768px){.plans-grid{flex-direction:column;align-items:center;gap:20px;overflow-x:visible;overflow-y:auto}}

            .plan-card{background:${isDark ? 'transparent' : '#ffffff'};border:${
            isDark ? '1px solid #e6e6e6' : '2px solid #e6e6e6'
        };border-radius:4px;padding:26px 24px;min-width:290px;max-width:350px;width:350px;flex:1;min-height:348px;font-family:'Outfit',sans-serif;position:relative;margin-top:30px}
            .plan-card.highlighted{border:${isDark ? '2px solid #ffffff' : '2px solid #000000'}}
            @media(max-width:768px){.plan-card{min-width:50%;max-width:400px;width:100%;padding:30px 20px}}

            .popular-badge{position:absolute;top:-12px;right:20px;background:#4d4d4d;color:#fff;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;z-index:100}
            .plan-title{font-size:28px;font-weight:700;color:#333}
            .plan-price .price-number{font-size:39px;font-weight:700;color:#4d4d4d;line-height:1}
            .plan-price .price-currency{font-size:16px;font-weight:400;color:#666;line-height:1;margin-top:4px;margin-left:4px}
            .included-resources .resource-box{border-radius:4px;padding:4px 2px;font-size:14px;font-weight:600;color:#4d4d4d;text-align:left}
            .section-title{font-size:18px;font-weight:600;color:#333;margin:0 0 8px 0}
            .plan-features{list-style:none}
            .plan-features .feature-item{padding:4px 0!important;margin-bottom:0!important;color:#4d4d4d;font-size:14px;font-weight:600}
            .plan-button{width:65%;padding:6px;border-radius:4px;font-size:15px;font-weight:400;font-family:'Outfit',sans-serif;cursor:pointer;transition:all .3s ease;border:1px solid;margin-top:auto}
            .plan-button.primary{background:#4d4d4d;color:#fff;border-color:#4d4d4d;font-weight:700}
            .plan-button.primary:hover{background:#333;border-color:#333}
            .plan-button.plan-button-disabled,.plan-button:disabled{opacity:.7!important;cursor:not-allowed!important;pointer-events:none!important}
            .divider{height:1px;background:#e0e0e0}
            *{box-sizing:border-box;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;color:${
                isDark ? '#ffffff' : ''
            }!important}
        `;
    }

    // ─── HTML string builders ─────────────────────────────────────────────────

    buildContainerHTML(plans: any[], theme: string, isLogin: boolean): string {
        if (plans.length === 0) {
            return `<div class="proxy-container"><div class="subscription-plans-container d-flex flex-column align-items-center justify-content-center"><div style="padding:20px;text-align:center;color:#666;font-size:16px;">No subscription plans available</div></div></div>`;
        }
        const plansHTML = plans.map((p) => this.buildPlanCardHTML(p, theme, isLogin)).join('');
        return `<div class="proxy-container"><div class="subscription-plans-container d-flex flex-column align-items-center justify-content-center"><div class="plans-grid d-flex flex-row gap-4 justify-content-start align-items-stretch w-100 py-3">${plansHTML}</div></div></div>`;
    }

    buildPlanCardHTML(plan: any, theme: string, isLogin: boolean): string {
        const isPopular = plan.plan_meta?.highlight_plan || false;
        const popularBadge = plan.plan_meta?.tag ? `<div class="popular-badge">${plan.plan_meta.tag}</div>` : '';
        const priceMatch = plan.plan_price?.match(/(\d+)\s+(.+)/);
        const priceValue = priceMatch ? priceMatch[1] : '0';
        const currency = priceMatch ? priceMatch[2] : 'USD';
        const iconFill = theme === PublicScriptTheme.Dark ? '#ffffff' : '#4d4d4d';
        const isDisabled = !!plan.isSubscribed;
        const cardClasses = `plan-card d-flex flex-column gap-3 position-relative${
            isPopular ? ' popular highlighted' : ''
        }${plan.isSelected ? ' selected' : ''}`;
        const buttonLabel = isLogin
            ? plan.isSubscribed
                ? 'Your current plan'
                : 'Get ' + plan.plan_name
            : 'Get Started';
        const disabledAttrs = isDisabled ? 'disabled aria-disabled="true"' : '';
        const disabledStyle = isDisabled ? 'cursor:not-allowed;pointer-events:none;' : '';

        return `<div class="${cardClasses}">
            ${popularBadge}
            <div>
                <h1 class="plan-title mt-0">${plan.plan_name}</h1>
                <div class="plan-price mb-3"><div class="price-container d-block mb-3"><span class="price-number">${priceValue}</span><span class="price-currency">${currency}</span></div></div>
                <button class="plan-button primary upgrade-btn${
                    isDisabled ? ' plan-button-disabled' : ''
                }" data-plan-id="${plan.id}" data-plan-data='${JSON.stringify(plan)}' ${disabledAttrs} style="opacity:${
            isDisabled ? 0.7 : 1
        };${disabledStyle}">${buttonLabel}</button>
                <div class="divider w-100 my-3"></div>
            </div>
            ${this.buildMetricsHTML(plan)}
            ${this.buildFeaturesHTML(plan, iconFill)}
            ${this.buildExtraFeaturesHTML(plan, iconFill)}
        </div>`;
    }

    private buildMetricsHTML(plan: any): string {
        if (!plan.plan_meta?.metrics?.length) return '';
        const rows = plan.plan_meta.metrics.map((m: string) => `<div class="resource-box">${m}</div>`).join('');
        return `<div class="included-resources mb-2"><h4 class="section-title text-left">Included</h4><div class="resource-boxes d-flex flex-column gap-2">${rows}</div></div>`;
    }

    private buildFeaturesHTML(plan: any, iconFill: string): string {
        const included: string[] = plan.plan_meta?.features?.included || [];
        const notIncluded: string[] = plan.plan_meta?.features?.notIncluded || [];
        if (!included.length && !notIncluded.length) return '';

        const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${iconFill}"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>`;
        const crossSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#999999"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>`;

        const includedItems = included
            .map(
                (f: string) =>
                    `<li class="feature-item included d-flex align-items-center position-relative p-0 gap-2 m-0"><span class="feature-icon included">${checkSvg}</span>${f}</li>`
            )
            .join('');
        const notIncludedItems = notIncluded
            .map(
                (f: string) =>
                    `<li class="feature-item not-included d-flex align-items-center position-relative p-0 gap-2"><span class="feature-icon not-included">${crossSvg}</span>${f}</li>`
            )
            .join('');

        return `<div class="mb-2 text-left"><h4 class="section-title text-left">Features</h4><ul class="plan-features gap-4 m-0 p-0 text-left">${includedItems}${notIncludedItems}</ul></div>`;
    }

    private buildExtraFeaturesHTML(plan: any, iconFill: string): string {
        if (!plan.plan_meta?.extra?.length) return '';
        const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${iconFill}"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"/></svg>`;
        const items = plan.plan_meta.extra
            .map(
                (f: string) =>
                    `<li class="feature-item extra d-flex align-items-center position-relative p-0 gap-2 m-0"><span class="feature-icon extra">${starSvg}</span>${f}</li>`
            )
            .join('');
        return `<div class="mb-4 text-left"><h4 class="section-title text-left">Extra</h4><ul class="plan-features gap-4 m-0 p-0 text-left">${items}</ul></div>`;
    }
}
