import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { UntypedFormControl, ValidatorFn } from '@angular/forms';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { fromEvent } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { BaseComponent } from '@msg91/ui/base-component';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { SharedService } from '@msg91/services/shared';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { DEBOUNCE_TIME } from '@msg91/constant';
import { CustomValidators } from '@msg91/custom-validator';

@Component({
    selector: 'msg91-email-domain-autocomplete',
    templateUrl: './email-domain-autocomplete.component.html',
    styleUrls: ['./email-domain-autocomplete.component.scss'],
})
export class EmailDomainAutocompleteComponent extends BaseComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() emailDomainFormControl: UntypedFormControl;
    @Input() createDomainURL: string;
    @Input() fromCampaign: boolean = false;
    @Input() clearFilter: boolean;
    @Input() formFieldAppearance: string = 'outline';

    @Output() fetchDomainListInprogress: EventEmitter<any> = new EventEmitter();
    @Output() getSelectedDomain: EventEmitter<any> = new EventEmitter();
    @Output() returnDomainList: EventEmitter<any> = new EventEmitter();
    @Output() optionSelected: EventEmitter<any> = new EventEmitter();
    @Output() clearDomainEvent: EventEmitter<void> = new EventEmitter();

    @ViewChild('emailDomainInput') public emailDomainInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

    public domains: { id: number; name: string; domain: string }[] = [];
    public domainInitialValue: string;
    public fetchDataWithoutKeyword: boolean = false;
    public showCloseDomain: boolean = false;
    public existInListValidatorFn: ValidatorFn;

    private emailDomainParams = {
        page: 1,
        last_page: 1,
        keyword: '',
    };

    constructor(
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private toast: PrimeNgToastService,
        @Inject(ProxyBaseUrls.EmailProxy) private emailUrl: any
    ) {
        super();
    }

    public ngAfterViewInit(): void {
        fromEvent(this.emailDomainInput.nativeElement, 'input')
            .pipe(
                tap((event: any) => {
                    if (event?.target?.value) {
                        this.showCloseDomain = true;
                    } else {
                        this.showCloseDomain = false;
                    }
                }),
                debounceTime(DEBOUNCE_TIME),
                takeUntil(this.destroy$)
            )
            .subscribe((event: any) => {
                this.emailDomainParams.keyword = event?.target?.value;
                this.emailDomainParams.page = 1;
                this.fetchEmailDomains(this.emailDomainParams.keyword);
            });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes?.clearFilter) {
            this.clearDomain();
        }
        if (changes?.emailDomainFormControl) {
            this.domainInitialValue = this.emailDomainFormControl.value?.domain;
            this.showCloseDomain = this.domainInitialValue ? true : false;
            this.fetchEmailDomains(this.domainInitialValue);
        }
    }

    /**
     * Fetches next Domain page
     *
     * @memberof CampaignEmailFormComponent
     */
    public fetchNextDomainPage(): void {
        if (this.emailDomainParams.page < this.emailDomainParams.last_page) {
            this.emailDomainParams = {
                ...this.emailDomainParams,
                page: this.emailDomainParams.page + 1,
            };
            this.fetchEmailDomains(this.emailDomainParams?.keyword ?? null, true);
        }
    }

    /**
     * Select Domain
     */
    public selectDomain(): void {
        if (this.emailDomainFormControl.value?.domain) {
            this.showCloseDomain = true;
        }
        const selectedDomain = this.domains.find((e) => e.domain === this.emailDomainFormControl.value?.domain);
        this.getSelectedDomain.emit(selectedDomain);
    }

    public domainDisplayFunction(domain: { id: string; domain: string }): string {
        return domain?.domain;
    }

    public refreshDomain(): void {
        this.domains = [];
        this.emailDomainParams = {
            page: 1,
            last_page: 1,
            keyword: null,
        };
        this.fetchEmailDomains(this.emailDomainParams.keyword);
    }

    public clearDomain(): void {
        this.domains = [];
        this.showCloseDomain = false;
        this.emailDomainFormControl.patchValue('');
        this.emailDomainParams.keyword = '';
        this.emailDomainParams.page = 1;
        this.fetchEmailDomains(this.emailDomainParams.keyword);
        this.clearDomainEvent.emit();
    }

    /**
     * Set emailDomainFormControl value
     *
     * @param {*} value
     * @memberof EmailDomainAutocompleteComponent
     */
    public setDomainControlValue(value: any) {
        this.emailDomainFormControl.setValue(value);
        this.emailDomainFormControl.markAsDirty();
        this.showCloseDomain = true;
        this.optionSelected.emit(value);
    }

    /**
     * Fetches email Domains
     *
     * @private
     * @memberof CampaignEmailFormComponent
     */
    private fetchEmailDomains(keyword?: string, nextPage?: boolean): void {
        this.fetchDomainListInprogress.emit(true);
        const payload = {
            url: `${this.emailUrl}/domains`,
            params: {
                page: this.emailDomainParams.page,
                keyword: keyword ? keyword : '',
                is_enabled: 1,
                status_id: 2,
            },
        };
        this.sharedService.getEmailDomain(payload).subscribe(
            (res) => {
                this.formatDomainResponse(res, keyword, nextPage);
            },
            (error: any) => {
                this.fetchDomainListInprogress.emit(false);
                this.toast.error(
                    error?.errors?.[0] || error?.errors?.permission?.[0] || error?.message || 'Something went wrong.'
                );
            }
        );
    }

    private formatDomainResponse(res, keyword: string, nextPage?: boolean): void {
        const data = res.data.data;
        if (keyword !== null) {
            // Either data is searched or pre-filled from API response
            this.domains = data;
            if (keyword === this.domainInitialValue) {
                if (data.length === 0 && !this.fetchDataWithoutKeyword) {
                    this.fetchDataWithoutKeyword = true;
                    this.fetchEmailDomains();
                }
                this.emailDomainFormControl.setValue(data.find((domain) => domain.domain === this.domainInitialValue));
            }
            this.optionSelected.emit();
        } else {
            if (nextPage) {
                // Load more case
                this.domains.push(...data);
            } else {
                // Either data is searched or pre-filled from API response
                this.domains = data;
            }
        }
        this.emailDomainParams.last_page = res.data.last_page;
        if (this.existInListValidatorFn) {
            this.emailDomainFormControl.removeValidators(this.existInListValidatorFn);
        }
        this.existInListValidatorFn = CustomValidators.elementExistsInList(
            this.domains.map((obj) => obj.domain),
            'domain'
        );
        this.emailDomainFormControl.addValidators(this.existInListValidatorFn);
        this.fetchDomainListInprogress.emit(false);
        this.selectDomain();
        this.returnDomainList.emit(this.domains);
        this.cdr.detectChanges();
    }
}
