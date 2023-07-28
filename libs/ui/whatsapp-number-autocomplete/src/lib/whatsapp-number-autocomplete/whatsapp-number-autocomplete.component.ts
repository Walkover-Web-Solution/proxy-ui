import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { fromEvent, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, takeUntil, tap } from 'rxjs/operators';
import { BaseComponent } from '@msg91/ui/base-component';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { IWhatsAppNumberResModel } from '@msg91/models/whatsapp-models';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FlowService } from '@msg91/service';
import { isEqual } from 'lodash';

@Component({
    selector: 'msg91-whatsapp-number-autocomplete',
    templateUrl: './whatsapp-number-autocomplete.component.html',
    styleUrls: ['./whatsapp-number-autocomplete.component.scss'],
    providers: [FlowService],
})
export class WhatsAppNumberAutocompleteComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() whatsAppNumberFormControl: UntypedFormControl;
    @Input() createNumberURL: string;
    @Input() clearFilter: boolean;
    @Input() appearance = 'outline';
    @Output() fetchNumberListInprogress: EventEmitter<any> = new EventEmitter();
    @Output() getSelectedNumber: EventEmitter<any> = new EventEmitter();
    @Output() returnNumberList: EventEmitter<any> = new EventEmitter();
    @Output() clearNumberValue: EventEmitter<any> = new EventEmitter();
    @ViewChild('whatsAppNumberInput') public whatsAppNumberInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
    @Input() labelFloat: boolean = true;
    public numbers$: Observable<IWhatsAppNumberResModel[]> = of([]);
    public searchedNumber$: Observable<IWhatsAppNumberResModel[]> = of([]);
    public numbers: IWhatsAppNumberResModel[] = [];
    public selectedNumberVariable: string[];
    public showCloseNumber: boolean = false;
    public searchedNumber: string = '';
    public apiInProgress: boolean = false;

    constructor(
        private flowService: FlowService,
        private cdr: ChangeDetectorRef,
        private toast: PrimeNgToastService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailUrl: any
    ) {
        super();
    }

    ngAfterViewInit() {
        fromEvent(this.whatsAppNumberInput.nativeElement, 'input')
            .pipe(
                tap((event: any) => {
                    if (event?.target?.value) {
                        this.showCloseNumber = true;
                    } else {
                        this.showCloseNumber = false;
                    }
                }),
                debounceTime(700),
                takeUntil(this.destroy$)
            )
            .subscribe((event: any) => {
                this.searchedNumber = event?.target?.value;
                this.numberList();
            });
    }

    ngOnInit(): void {
        this.fetchWhatsAppNumbers();

        this.numbers$.pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$)).subscribe((res) => {
            this.numbers = res;
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (this.clearFilter) {
                this.clearNumber();
            }
        }
    }

    private numberList(): void {
        this.numbers$.pipe(take(1)).subscribe((res) => {
            const whatsAppNumbers = res?.filter((number) => number.whatsapp_number.includes(this.searchedNumber));
            this.searchedNumber$ = of(whatsAppNumbers);
            this.returnNumberList.emit(whatsAppNumbers);
            this.cdr.detectChanges();
        });
    }

    /**
     * Select Number
     */
    public selectNumber(): void {
        if (this.whatsAppNumberFormControl.value?.whatsapp_number) {
            this.showCloseNumber = true;
        }
        const selectedNumber = this.numbers.find(
            (e) => e.whatsapp_number === this.whatsAppNumberFormControl?.value?.whatsapp_number
        );
        if (selectedNumber) {
            this.getSelectedNumber.emit(selectedNumber);
        }
    }

    public numberDisplayFunction(number: IWhatsAppNumberResModel): string {
        return number?.whatsapp_number;
    }

    public refreshNumber(): void {
        this.numbers = [];
        this.fetchWhatsAppNumbers();
    }

    public clearNumber(): void {
        this.numbers = [];
        this.showCloseNumber = false;
        this.whatsAppNumberFormControl.patchValue('');
        this.fetchWhatsAppNumbers();
        this.clearNumberValue.emit();
    }

    public setControlValue(event: any): void {
        if (!this.whatsAppNumberFormControl.value?.whatsapp_number) {
            this.whatsAppNumberFormControl.setValue(event);
            this.whatsAppNumberFormControl.markAsDirty();
            this.selectNumber();
        }
    }

    /**
     * Fetches email numbers
     *
     * @private
     * @memberof CampaignEmailFormComponent
     */
    private fetchWhatsAppNumbers(): void {
        if (this.apiInProgress) {
            return;
        }
        this.apiInProgress = true;
        this.fetchNumberListInprogress.emit(true);
        const payload = {
            url: `/whatsapp-client-panel/number/`,
        };
        this.flowService.getWhatsAppNumbers(payload?.url).subscribe(
            (response) => {
                const whatsAppNumbers = response?.data?.filter(
                    (number) =>
                        number.vendor_id !== 1 && number?.status === 'active' && number?.inbound_setting !== 'CALLBACK'
                );
                this.numbers$ = of(whatsAppNumbers);
                this.numbers = whatsAppNumbers;
                this.numberList();
                this.fetchNumberListInprogress.emit(false);
                this.selectNumber();
                this.apiInProgress = false;
            },
            (error) => {
                this.fetchNumberListInprogress.emit(false);
                this.toast.error(error?.errors[0] || error?.message);
                this.apiInProgress = false;
            }
        );
    }
}
