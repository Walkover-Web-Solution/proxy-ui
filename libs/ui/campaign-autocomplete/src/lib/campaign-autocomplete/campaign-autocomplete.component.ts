import { DEBOUNCE_TIME } from '@msg91/constant';
import { CustomValidators } from '@msg91/custom-validator';
import { ComposeService } from '@msg91/services/msg91/compose';
import { take, tap, debounceTime, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@msg91/ui/base-component';
import {
    Component,
    OnInit,
    ChangeDetectorRef,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    TemplateRef,
} from '@angular/core';
import { fromEvent, Observable, of } from 'rxjs';
import { UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { ISegmentGetAllCampaignReqModel } from '@msg91/models/segmento-models';
import { BaseResponse, IPaginatedResponse } from '@msg91/models/root-models';
import { Router } from '@angular/router';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FlowService } from '@msg91/service';
@Component({
    selector: 'msg91-campaign-autocomplete',
    templateUrl: './campaign-autocomplete.component.html',
    styleUrls: ['./campaign-autocomplete.component.scss'],
})
export class CampaignAutocompleteComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() campaignForm: UntypedFormControl;
    /** True, if required asterisk needs to be shown in field */
    @Input() showRequiredAsterisk = false;
    /** True, if Campaign list needs to be reloaded (required when new campaign are created) */
    @Input() reloadCampaigns: boolean;

    /** Default with 50%*/
    @Input() formFiledWidth: string = 'w-50';
    @Input() setFormValueForSingleCampaign: boolean;
    @Input() showRefreshBtn = false;
    @Input() createCampaignURL: string;

    @Output() campaignSelected: EventEmitter<boolean> = new EventEmitter();
    @Output() fetchCampaignInProgressEmit: EventEmitter<Observable<boolean>> = new EventEmitter();
    @Output() minimizeEvent: EventEmitter<boolean> = new EventEmitter();
    @Output() fullScreenMailCompose: EventEmitter<boolean> = new EventEmitter();
    @ViewChild('campaignInput') public campaignInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
    public campaigns$: Observable<ISegmentGetAllCampaignReqModel[]> = of([]);
    public params: any = {};
    public optionSelected = false;
    @Input() showDuplicate: boolean = false;
    @Output() duplicateCampaign: EventEmitter<any> = new EventEmitter();
    @Input() createCampaign: boolean = false;
    @Output() createCampaignEmitter: EventEmitter<any> = new EventEmitter();
    /**
     * Form field appearance
     * @default legacy
     */
    @Input() formFieldAppearance = 'legacy';
    /**
     * Wether channel type need to get or not.
     * @default false
     */
    @Input() getChannelType: boolean = false;
    /**
     * Out put event for return selected channel type
     */
    @Output() selectedChannelType: EventEmitter<any> = new EventEmitter();

    public allChannel$ = of([]);

    /**
     * Returns true if control has required validator
     *
     * @readonly
     * @type {boolean}
     * @memberof CampaignAutocompleteComponent
     */
    public get hasRequiredValidator(): boolean {
        return this.campaignForm?.hasValidator(Validators.required);
    }

    private ValidatorFnRef: ValidatorFn;

    constructor(
        private composeService: ComposeService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private flowService: FlowService
    ) {
        super();
    }

    public campaignDisplayFunction(campaign: ISegmentGetAllCampaignReqModel): string {
        return campaign?.name;
    }

    ngOnInit(): void {
        this.params = {
            pageNo: 1,
            itemsPerPage: 25,
        };
        if (!this.campaignForm.value) {
            this.clearCampaign(false);
        } else {
            this.fetchCampaign(this.params);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes.reloadCampaigns &&
            changes.reloadCampaigns.previousValue !== changes.reloadCampaigns.currentValue &&
            changes.reloadCampaigns.currentValue
        ) {
            delete this.params.name;
            this.reloadCampaignList();
        }
        if (changes?.getChannelType?.currentValue) {
            this.getCampaignChannel();
        }
    }

    ngAfterViewInit() {
        fromEvent(this.campaignInput.nativeElement, 'input')
            .pipe(debounceTime(DEBOUNCE_TIME), takeUntil(this.destroy$))
            .subscribe((event: any) => {
                this.params.name = event?.target?.value;
                this.params.pageNo = 1;
                this.fetchCampaign(this.params);
                if (this.optionSelected) {
                    this.campaignSelected.emit(false);
                    this.optionSelected = false;
                }
            });
    }

    public fetchNextCampaignPage(): void {
        this.campaigns$.pipe(take(1)).subscribe((res) => {
            if (res.length === this.params.itemsPerPage * this.params.pageNo) {
                this.params.pageNo += 1;
                this.fetchCampaign(this.params, true);
            }
        });
    }

    public clearCampaign(emitCampaignSelected: boolean = true): void {
        this.campaignForm.setValue('');
        delete this.params.name;
        this.params.pageNo = 1;
        if (emitCampaignSelected) {
            this.campaignSelected.emit(false);
        }
        this.optionSelected = false;
        setTimeout(() => {
            this.fetchCampaign(this.params);
        }, 0);
        this.cdr.detectChanges();
    }

    public reloadCampaignList(): void {
        this.params.pageNo = 1;
        this.fetchCampaign(this.params);
    }

    public fetchCampaign(params: any, nextPage?: boolean): void {
        this.fetchCampaignInProgressEmit.emit(of(true));
        this.composeService.getCampaigns(params).subscribe(
            (response: BaseResponse<IPaginatedResponse<ISegmentGetAllCampaignReqModel[]>, null>) => {
                let campaigns;
                if (nextPage) {
                    this.campaigns$.pipe(take(1)).subscribe((campaign) => {
                        campaign.push(...response.data.data);
                        campaigns = campaign;
                        this.campaigns$ = of(campaign);
                    });
                } else {
                    this.campaigns$ = of(response.data.data);
                    // select first if there is only one campaign in list
                    if (this.setFormValueForSingleCampaign && !params?.name && response.data.data.length === 1) {
                        this.campaignForm.setValue(response.data?.data?.[0] ?? '');
                    }
                    // redirect to step second if there is no campaign in list.
                    if (
                        response.data.data.length === 0 &&
                        this.createCampaignEmitter.observed &&
                        !this.params?.name?.length
                    ) {
                        this.autocompleteTrigger?.closePanel();
                        this.createCampaignEmitter.emit(false);
                    }
                    campaigns = response.data.data;
                }
                /**
                 * we are storing ref of validationFn function because on time of
                 * remove removeValidators function need same ref of validationFn
                 */
                this.ValidatorFnRef = this.getValidationElementExist();
                this.campaignForm.setValidators([Validators.required, this.ValidatorFnRef]);
                // CustomValidators.elementExistsInList(
                //     campaigns.map((obj) => obj.id),
                //     'id'
                // ),
                this.campaignForm.updateValueAndValidity();
                this.fetchCampaignInProgressEmit.emit(of(false));
                this.cdr.detectChanges();
            },
            (errors: any) => {
                this.fetchCampaignInProgressEmit.emit(of(false));
            }
        );
    }

    public navigateToCreateCampaign(): void {
        if (this.createCampaignURL) {
            window.open(this.createCampaignURL, '_blank');
        } else {
            this.router.navigate(
                ['/m', 'l', { outlets: { primary: ['campaigns', 'flow'], navigationRouter: ['campaigns'] } }],
                {
                    queryParams: {
                        module: 'campaigns',
                        isCampaignCreate: true,
                    },
                }
            );
        }
        this.minimizeEvent.emit(true);
        this.fullScreenMailCompose.emit(false);
    }

    public handleCampaignSelection(value: any): void {
        if (!value) {
            if (this.createCampaign) {
                if (this.params?.name?.length) {
                    this.clearCampaign();
                }
                this.createCampaignEmitter.emit(true);
            } else {
                this.navigateToCreateCampaign();
            }
        } else {
            this.campaignSelected.emit(true);
            this.optionSelected = true;
        }
    }

    public setCampaignControlValue(value: any) {
        if (this.setFormValueForSingleCampaign && !this.campaignForm.value?.id) {
            setTimeout(() => {
                this.campaignForm.setValue(value);
                this.campaignForm.markAsDirty();
                this.handleCampaignSelection(value);
            });
        }
    }

    public duplicate(campaign: any) {
        this.autocompleteTrigger.closePanel();
        this.duplicateCampaign.emit(campaign);
    }

    public getCampaignChannel() {
        this.flowService.getCampaignChannelType().subscribe({
            next: (channel) => {
                if (!channel?.hasError && channel?.data?.length) {
                    this.allChannel$ = of(channel.data.filter((f) => f.name !== 'Condition'));
                }
            },
        });
    }

    closeMenu(menuTemplateRef: any) {
        menuTemplateRef.closeMenu();
    }

    channelSelected(channelType: any) {
        this.selectedChannelType.emit(channelType);
        /** to show selected channel name we have to set value in form control. */
        this.campaignForm.setValue(channelType);
        this.addRemoveValidationElementExist(false);
    }

    /**
     * remove validation because channel list is not in autocomplete option.
     * else add it.
     */
    addRemoveValidationElementExist(addValidation: boolean) {
        // const checkValidationExist = this.getValidationElementExist();
        if (!addValidation) {
            this.campaignForm.removeValidators(this.ValidatorFnRef);
        } else {
            this.campaignForm.addValidators(this.ValidatorFnRef);
        }
        this.campaignForm.updateValueAndValidity();
    }

    /**
     *
     * @returns {ValidatorFn}
     */
    getValidationElementExist(): ValidatorFn {
        const campaigns = [this.campaignForm.value?.id ? this.campaignForm.value : []].concat(
            this.getValueFromObservable(this.campaigns$)
        );
        return CustomValidators.elementExistsInList(
            campaigns.map((obj) => obj.id),
            'id'
        );
    }
}
