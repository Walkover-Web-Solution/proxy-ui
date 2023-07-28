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
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { BaseComponent } from '@msg91/ui/base-component';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { SharedService } from '@msg91/services/shared';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
    selector: 'msg91-sms-template-autocomplete',
    templateUrl: './sms-template-autocomplete.component.html',
    styleUrls: ['./sms-template-autocomplete.component.scss'],
})
export class smsTemplateAutocompleteComponent
    extends BaseComponent
    implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
    @Input() smsTemplateFormControl: UntypedFormControl;
    @Input() createTemplateURL: string;
    @Input() fromAdminPanel: boolean = false;
    @Input() fromCampaign: boolean = false;
    @Input() clearFilter: boolean;
    @Input() fetchVerifiedTemplate: boolean = false;
    @Input() selectSMSTemplateEvent: BehaviorSubject<string>;
    @Input() reloadAutoCompleteForm: Subject<void>;
    @Input() isOTP: boolean = false;
    @Output() fetchTemplateListInprogress: EventEmitter<any> = new EventEmitter();
    @Output() getSelectedTemplate: EventEmitter<any> = new EventEmitter();
    @Output() returnTemplateList: EventEmitter<any> = new EventEmitter();
    @Output() openCreateTemplate: EventEmitter<any> = new EventEmitter();
    @ViewChild('smsTemplateInput') public smsTemplateInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
    public templates: { template_id: number; name: string; variables: string[]; slug: string }[] = [];
    public selectedTemplateVariable: string[];
    public showCloseTemplate: boolean = false;
    public allDataFetched: boolean = false;
    readonly smsTempID = 'smsTemplateAutocomplete';

    @Input() appearance = 'outline';

    private smsTemplateParams = {
        last_page: 1,
        search: '',
        filterByStatus: ['approved'],
        pageNo: 1,
    };

    constructor(
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private toast: PrimeNgToastService,
        @Inject(ProxyBaseUrls.BaseURL) private smsUrl: any
    ) {
        super();
    }

    public ngAfterViewInit(): void {
        fromEvent(this.smsTemplateInput.nativeElement, 'input')
            .pipe(
                tap((event: any) => {
                    if (event?.target?.value) {
                        this.showCloseTemplate = true;
                    } else {
                        this.showCloseTemplate = false;
                    }
                }),
                debounceTime(700),
                takeUntil(this.destroy$)
            )
            .subscribe((event: any) => {
                this.smsTemplateParams.search = event?.target?.value;
                this.smsTemplateParams[this.isOTP ? 'pageNo' : 'page'] = 1;
                this.selectSMSTemplateEvent?.next(null);
                this.fetchSmsTemplates(this.smsTemplateParams.search);
            });
    }

    public ngOnInit(): void {
        this.smsTemplateParams[this.isOTP ? 'pageNo' : 'page'] = 1;
        if (this.isOTP) {
            this.smsTemplateParams['limit'] = 25;
        }
        this.fetchSmsTemplates(this.smsTemplateFormControl.value?.template_id);
        this.selectSMSTemplateEvent?.subscribe((res) => {
            this.selectTemplate(res);
        });
        this.reloadAutoCompleteForm?.subscribe(() => {
            this.fetchSmsTemplates(this.smsTemplateFormControl.value?.template_id);
        });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (this.clearFilter) {
                this.clearTemplate();
            }
        }
    }

    /**
     * Fetches next template page
     *
     * @memberof CampaignsmsFormComponent
     */
    public fetchNextTemplatePage(event): void {
        if (
            event === this.smsTempID &&
            (this.isOTP || this.smsTemplateParams['pageNo'] < this.smsTemplateParams.last_page)
        ) {
            if (this.allDataFetched) {
                return;
            }
            this.smsTemplateParams = {
                ...this.smsTemplateParams,
                pageNo: this.smsTemplateParams['pageNo'] + 1,
            };
            this.fetchSmsTemplates(this.smsTemplateParams?.search ?? '', true);
        }
    }

    /**
     * Select Template
     */
    public selectTemplate(template_id?: string): void {
        if (template_id || this.smsTemplateFormControl.value?.template_id) {
            this.showCloseTemplate = true;
        }
        const selectedTemplate = this.templates.find(
            (e) => e.template_id === (template_id ?? this.smsTemplateFormControl.value?.template_id)
        );
        if (this.isOTP && selectedTemplate) {
            this.smsTemplateFormControl.setValue(selectedTemplate);
            this.smsTemplateFormControl.updateValueAndValidity();
            this.getSelectedTemplate.emit(selectedTemplate);
        } else if (selectedTemplate) {
            const apiPayload = {
                url: this.smsUrl + '/api/v5/campaign/getTemplateDetails',
                id: selectedTemplate?.template_id,
            };
            this.sharedService.getSMSTemplateDetails(apiPayload).subscribe((res) => {
                this.smsTemplateFormControl.setValue({ ...selectedTemplate, ...res?.data?.[0] });
                this.smsTemplateFormControl.updateValueAndValidity();
                this.getSelectedTemplate.emit(res?.data?.[0]);
            });
        } else {
            this.showCloseTemplate = false;
        }
    }

    public templateDisplayFunction(template: {
        id: string;
        name: string;
        variables: string[];
        template_name: string;
    }): string {
        return template?.template_name ?? template?.name;
    }

    public refreshTemplate(): void {
        this.templates = [];
        this.smsTemplateParams = {
            ...this.smsTemplateParams,
            pageNo: 1,
            last_page: 1,
            search: this.smsTemplateFormControl.value.name || this.smsTemplateFormControl.value,
        };
        this.fetchSmsTemplates(this.smsTemplateFormControl.value.name);
    }

    public clearTemplate(): void {
        this.templates = [];
        this.showCloseTemplate = false;
        this.smsTemplateFormControl.patchValue('');
        this.smsTemplateParams.search = '';
        this.smsTemplateParams[this.isOTP ? 'pageNo' : 'page'] = 1;
        this.selectSMSTemplateEvent?.next(null);
        this.fetchSmsTemplates(this.smsTemplateParams.search);
    }

    public setSmsControlValue(value: any) {
        if (!this.smsTemplateFormControl.value?.template_id) {
            this.smsTemplateFormControl.setValue(value);
            this.smsTemplateFormControl.markAsDirty();
            this.selectTemplate();
        }
    }

    /**
     * Fetches sms templates
     *
     * @private
     * @memberof CampaignsmsFormComponent
     */
    private fetchSmsTemplates(keyword?: string, nextPage?: boolean): void {
        this.fetchTemplateListInprogress.emit(true);
        this.smsTemplateParams.search = keyword ?? this.selectSMSTemplateEvent?.getValue();
        const payload = { ...this.smsTemplateParams };
        if (this.fromAdminPanel) {
            const options = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                withCredentials: false,
            };
            payload['options'] = options;
        }
        const apiPayload = {
            url: this.smsUrl + (this.isOTP ? '/api/v5/otp/getAllOtpTemplate' : '/api/v5/sms/getAllSmsTemplate'),
            request: payload,
        };
        this.sharedService.getSMSTemplate(apiPayload).subscribe(
            (res) => {
                this.formatTemplateResponse(res, nextPage);
            },
            (error: any) => {
                this.fetchTemplateListInprogress.emit(false);
                this.toast.error(error?.errors[0] || error?.message);
            }
        );
    }

    private formatTemplateResponse(res, nextPage?: boolean): void {
        const data = this.isOTP ? res.data : res.data.data;
        if (!data.length) {
            this.allDataFetched = true;
            return;
        }
        const formattedResponse = this.isOTP
            ? data
            : data.map((template) => ({
                  template_id: template.template_id,
                  name: template.template_name,
              }));
        if (nextPage) {
            // Load more case
            this.templates.push(...formattedResponse);
        } else {
            // Either data is searched or pre-filled from API response
            this.templates = formattedResponse;
        }
        this.smsTemplateParams.last_page = res.data.totalPageCount;
        this.fetchTemplateListInprogress.emit(false);
        this.returnTemplateList.emit(this.templates);
        this.selectTemplate(this.selectSMSTemplateEvent?.getValue());
        this.cdr.detectChanges();
    }
}
