import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { errorResolver } from '@proxy/models/root-models';
import { EndpointService } from '@proxy/services/proxy/endpoint';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { Observable, switchMap } from 'rxjs';

@Injectable()
export class NewMethodDialogComponentStore extends ComponentStore<any> {
    constructor(private service: EndpointService, private toast: PrimeNgToastService) {
        super();
    }

    readonly verficationIntegration = this.effect((data: Observable<{}>) => {
        return data.pipe(
            switchMap((req) => {
                return this.service.verficationIntegration(req).pipe(
                    tapResponse(
                        (res: any) => {
                            if (res?.hasError) {
                                this.showError(res.errors);
                                return this.patchState({});
                            }
                            return this.patchState({
                                isLoading: false,
                            });
                        },
                        (error: any) => {
                            this.showError(error.errors);
                            this.patchState({ isLoading: false });
                        }
                    )
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
