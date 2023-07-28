import { Inject, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { BaseResponse, ProxyBaseUrls } from '@msg91/models/root-models';
import {
    bankDetailReq,
    CountrySlabPriceReqModel,
    ExtraBenefitResModel,
    MakeOrderReqModel,
    MakeOrderResModel,
    MakePaymentReqModel,
    PriceListReqModel,
    PriceListResModel,
    StripeAddSubscriptionReqModel,
} from '@msg91/models/setting-models';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { PaymentMethodUrls } from '@msg91/urls/payment-method';

@NgModule({
    imports: [CommonModule],
})
export class ServicesMsg91PaymentMethodModule {}

@Injectable({
    providedIn: ServicesMsg91PaymentMethodModule,
})
export class PaymentMethodService {
    constructor(private http: HttpWrapperService, @Inject(ProxyBaseUrls.BaseURL) private baseUrl: any) {}

    public getPriceList(request: PriceListReqModel): Observable<BaseResponse<PriceListResModel, PriceListReqModel>> {
        return this.http.get<any>(PaymentMethodUrls.getPriceList(this.baseUrl), request);
    }

    public makeOrder(
        request: MakeOrderReqModel | bankDetailReq
    ): Observable<BaseResponse<MakeOrderResModel, MakeOrderReqModel | bankDetailReq>> {
        return this.http.post<any>(PaymentMethodUrls.makeOrder(this.baseUrl), request);
    }

    public onSuccessPayment(request: MakePaymentReqModel): Observable<BaseResponse<any, MakePaymentReqModel>> {
        return this.http.post<any>(PaymentMethodUrls.makePayment(this.baseUrl), request);
    }

    public getExtraBenefit(request: {
        amount: number;
    }): Observable<BaseResponse<ExtraBenefitResModel, { amount: number }>> {
        return this.http.post<BaseResponse<ExtraBenefitResModel, { amount: number }>>(
            PaymentMethodUrls.getExtraBenefit(this.baseUrl),
            request
        );
    }

    public getCountrySlabPrice(
        request: CountrySlabPriceReqModel
    ): Observable<BaseResponse<any, CountrySlabPriceReqModel>> {
        return this.http.get<BaseResponse<any, CountrySlabPriceReqModel>>(
            PaymentMethodUrls.getCountrySlabPrice(this.baseUrl),
            request
        );
    }

    public stripeGetSubscription(): Observable<BaseResponse<any, any>> {
        return this.http.get(PaymentMethodUrls.stripeGetSubscription(this.baseUrl));
    }

    public stripeAddSubscription(request: StripeAddSubscriptionReqModel): Observable<BaseResponse<any, any>> {
        return this.http.post(PaymentMethodUrls.stripeSubscription(this.baseUrl), request);
    }

    public stripeGetLinkForAddSubscription(): Observable<BaseResponse<any, any>> {
        return this.http.get(PaymentMethodUrls.stripeGetLinkForAddSubscription(this.baseUrl));
    }

    public stripeUpdateSubscription(request: any): Observable<BaseResponse<any, any>> {
        return this.http.post(PaymentMethodUrls.stripeUpdateSubscription(this.baseUrl), request);
    }

    public cashFreeGetSubscription(): Observable<BaseResponse<any, any>> {
        return this.http.get(PaymentMethodUrls.cashFreeGetSubscription(this.baseUrl));
    }

    public cashFreeAddSubscription(request: any): Observable<BaseResponse<any, any>> {
        return this.http.post(PaymentMethodUrls.cashFreeSubscription(this.baseUrl), request);
    }

    public cashFreeCancelSubscription(): Observable<BaseResponse<any, any>> {
        return this.http.get(PaymentMethodUrls.cashFreeCancelSubscription(this.baseUrl));
    }

    public cashFreeGetAllSubscription(request: any): Observable<BaseResponse<any, any>> {
        return this.http.post(PaymentMethodUrls.cashFreeGetAllSubscription(this.baseUrl), request);
    }

    public cashFreeUpdateSubscription(request: any): Observable<BaseResponse<any, any>> {
        return this.http.put(PaymentMethodUrls.cashFreeUpdateSubscription(this.baseUrl), request);
    }

    public createCashFreeMandate(request: any): Observable<BaseResponse<any, any>> {
        return this.http.post(PaymentMethodUrls.cashFreeMandate(this.baseUrl), request);
    }

    public getCashFreeMandate(params: any): Observable<BaseResponse<any, any>> {
        return this.http.get(PaymentMethodUrls.cashFreeMandate(this.baseUrl), params);
    }

    public cancelCashFreeMandate(params: any): Observable<BaseResponse<any, any>> {
        return this.http.delete(PaymentMethodUrls.removeCashFreeMandate(this.baseUrl).replace(':Id', params.mandateId));
    }

    public mandatePayment(params: any): Observable<BaseResponse<any, any>> {
        return this.http.post(PaymentMethodUrls.mandatePayment(this.baseUrl), params);
    }
}
