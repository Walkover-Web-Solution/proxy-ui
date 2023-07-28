import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { MicroServiceTypeDropdownComponentStore } from './microservice-type-dropdown.store';
import { MicroServiceTypeDropdownService } from './microservice-type-dropdown.services';
import { Observable } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { IMicroserviceType } from '@msg91/models/subscription-models';

@Component({
    selector: 'msg91-microservice-type-dropdown',
    templateUrl: './microservice-type-dropdown.component.html',
    styleUrls: ['./microservice-type-dropdown.component.scss'],
    providers: [MicroServiceTypeDropdownComponentStore, MicroServiceTypeDropdownService],
})
export class MicroServiceTypeDropdownComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
    @Input() public selectedMicroServiceId: string = '';
    @Input() public displaySMS = false;
    @Output() public microserviceSelected = new EventEmitter<string>();
    @Output() public microservices = new EventEmitter<IMicroserviceType[]>();
    public microServiceType$: Observable<IMicroserviceType[]> = this.componentStore.microServiceType$;
    public selectedName: string = 'All';
    public imagePath: string;

    constructor(private componentStore: MicroServiceTypeDropdownComponentStore) {
        super();
    }

    public ngOnInit(): void {
        this.componentStore.getMicroServiceType({ displaySMS: this.displaySMS });
        this.microServiceType$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            this.microservices.emit(res);
            this.makeSelectedMicroservice();
        });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedMicroServiceId']) {
            this.makeSelectedMicroservice();
        }
    }

    public makeSelectedMicroservice(): void {
        this.microServiceType$.pipe(take(1)).subscribe((res) => {
            if (res && res.length) {
                this.selectedName =
                    this.selectedMicroServiceId === ''
                        ? 'All'
                        : res?.find((e) => e.id === +this.selectedMicroServiceId)?.name;
                this.imagePath =
                    'assets/images/microservice-icon/' + this.selectedName.toLowerCase().split(' ').join('') + '.svg';
            }
        });
    }
}
