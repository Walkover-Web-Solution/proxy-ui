import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { catchError, switchMap } from 'rxjs/operators';
import { EMPTY, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseResponse } from '@msg91/models/root-models';
import { IMicroserviceType } from '@msg91/models/subscription-models';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { MicroServiceTypeDropdownService } from './microservice-type-dropdown.services';

@Injectable()
export class MicroServiceTypeDropdownComponentStore extends ComponentStore<IMicroServiceTypeDropdownComponentState> {
    constructor(private service: MicroServiceTypeDropdownService, private toast: PrimeNgToastService) {
        super({
            isLoading: true,
            microServiceType: [],
        });
    }

    readonly getMicroServiceType = this.effect((data: Observable<{ displaySMS: boolean }>) => {
        return data.pipe(
            switchMap(({ displaySMS }) => {
                return this.service.fetchMicroServices().pipe(
                    tapResponse(
                        (res: BaseResponse<IMicroserviceType[], any>) => {
                            if (displaySMS) {
                                // Added SMS in response of fetchMicroServices() for MicroServiceTypeDropdown
                                res.data.push({ id: -1, name: 'SMS' });
                            }
                            return this.setState((state) => ({
                                ...state,
                                microServiceType: res.data,
                                isLoading: false,
                            }));
                        },
                        (error: HttpErrorResponse) => {
                            this.toast.error(error.message);
                            return this.setState((state) => ({
                                ...state,
                                isLoading: false,
                            }));
                        }
                    ),
                    catchError((err) => {
                        return EMPTY;
                    })
                );
            })
        );
    });

    readonly isLoading$: Observable<boolean> = this.select((x) => x.isLoading);

    readonly microServiceType$: Observable<IMicroserviceType[]> = this.select((x) => x.microServiceType);
}

interface IMicroServiceTypeDropdownComponentState {
    isLoading: boolean;
    microServiceType: IMicroserviceType[];
}
