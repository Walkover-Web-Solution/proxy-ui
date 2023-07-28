import { NgModule, Injectable } from '@angular/core';
import { errorResolver } from '@msg91/models/root-models';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule],
})
export class ServicesAdminVoiceDialPlanUtilityModule {}

@Injectable({
    providedIn: ServicesAdminVoiceDialPlanUtilityModule,
})
export class DialPlanUtilityService {
    constructor(private toast: PrimeNgToastService) {}

    /**
     * Shows success/error toast based on the response
     *
     * @param {*} response Response from the API
     * @param {string} sucessMessage Success message in case of success
     * @memberof DialPlanUtilityService
     */
    public showToast(response: any, sucessMessage: string): void {
        if (response.hasError || response.errors) {
            const errorMessage = errorResolver(response.errors);
            this.toast.error(errorMessage[0]);
        } else {
            this.toast.success(sucessMessage);
        }
    }
}
