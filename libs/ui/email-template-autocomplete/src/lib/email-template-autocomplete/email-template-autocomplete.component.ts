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
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { BaseComponent } from '@msg91/ui/base-component';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { SharedService } from '@msg91/services/shared';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
    selector: 'msg91-email-template-autocomplete',
    templateUrl: './email-template-autocomplete.component.html',
    styleUrls: ['./email-template-autocomplete.component.scss'],
})
export class EmailTemplateAutocompleteComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() emailTemplateFormControl: UntypedFormControl;
    @Input() createTemplateURL: string;
    @Input() fromAdminPanel: boolean = false;
    @Input() fromCampaign: boolean = false;
    @Input() adminAuthToken: any;
    @Input() clearFilter: boolean;
    @Input() fetchVerifiedTemplate: boolean = false;
    @Input() selectEmailTemplateEvent: BehaviorSubject<string>;
    @Input() reloadAutoCompleteForm: Subject<void>;
    @Input() selectBySlug: boolean = false;
    @Input() selectedUser: number;
    @Input() checkTemplateWithNoVariable: boolean = false;
    @Input() disableAutoSelectDirective: boolean = false;
    @Output() fetchTemplateListInprogress: EventEmitter<any> = new EventEmitter();
    @Output() getSelectedTemplate: EventEmitter<any> = new EventEmitter();
    @Output() returnTemplateList: EventEmitter<any> = new EventEmitter();
    @ViewChild('emailTemplateInput') public emailTemplateInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
    public templates: { template_id: number; name: string; variables: string[]; slug: string }[] = [];
    public selectedTemplateVariable: string[];
    public showCloseTemplate: boolean = false;
    @Input() formFieldAppearance: string = 'outline';

    private emailTemplateParams = {
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
    ngAfterViewInit() {
        fromEvent(this.emailTemplateInput.nativeElement, 'input')
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
                this.emailTemplateParams.keyword = event?.target?.value;
                this.emailTemplateParams.page = 1;
                this.selectEmailTemplateEvent?.next(null);
                this.fetchEmailTemplates(this.emailTemplateParams.keyword);
            });
    }

    ngOnInit(): void {
        this.fetchEmailTemplates(this.emailTemplateFormControl.value?.slug);
        this.selectEmailTemplateEvent?.subscribe((res) => {
            this.selectTemplate(res);
        });
        this.reloadAutoCompleteForm?.subscribe(() => {
            this.fetchEmailTemplates(this.emailTemplateFormControl.value?.slug);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (this.clearFilter) {
                this.clearTemplate();
            }
        }
        if (changes?.selectedUser && this.fromAdminPanel) {
            this.fetchEmailTemplates(this.emailTemplateFormControl.value?.slug);
        }
    }

    /**
     * Fetches next template page
     *
     * @memberof CampaignEmailFormComponent
     */
    public fetchNextTemplatePage(): void {
        if (this.emailTemplateParams.page < this.emailTemplateParams.last_page) {
            this.emailTemplateParams = {
                ...this.emailTemplateParams,
                page: this.emailTemplateParams.page + 1,
            };
            this.fetchEmailTemplates(this.emailTemplateParams?.keyword ?? null, true);
        }
    }

    /**
     * Select Template
     */
    public selectTemplate(template_id?: string): void {
        if (template_id ?? this.emailTemplateFormControl.value?.template_id) {
            this.showCloseTemplate = true;
        }
        const selectedTemplate = this.templates.find((e) =>
            this.selectBySlug
                ? e.slug === (template_id ?? this.emailTemplateFormControl.value?.slug)
                : e.template_id === (template_id ?? this.emailTemplateFormControl.value?.template_id)
        );
        if (selectedTemplate) {
            this.emailTemplateFormControl.setValue(selectedTemplate);
            this.emailTemplateFormControl.updateValueAndValidity();
            this.getSelectedTemplate.emit(selectedTemplate);
        }
        if (this.checkTemplateWithNoVariable && selectedTemplate?.template_id && !selectedTemplate?.variables?.length) {
            this.emailTemplateFormControl.setErrors({
                ...this.emailTemplateFormControl.errors,
                noVariableFound: 'Template should contain atleast one variable',
            });
        }
    }

    public templateDisplayFunction(template: { id: string; name: string; variables: string[]; slug: string }): string {
        return template?.slug;
    }

    public refreshTemplate(): void {
        this.templates = [];
        this.emailTemplateParams = {
            page: 1,
            last_page: 1,
            keyword: this.emailTemplateFormControl.value?.slug,
        };
        this.fetchEmailTemplates(this.emailTemplateFormControl.value?.slug);
    }

    public clearTemplate(): void {
        this.templates = [];
        this.showCloseTemplate = false;
        this.emailTemplateFormControl.patchValue('');
        this.emailTemplateParams.keyword = '';
        this.emailTemplateParams.page = 1;
        this.selectEmailTemplateEvent?.next(null);
        this.emailTemplateFormControl.updateValueAndValidity();
        this.fetchEmailTemplates(this.emailTemplateParams.keyword);
        this.getSelectedTemplate.emit(null);
    }

    /**
     * Fetches email templates
     *
     * @private
     * @memberof CampaignEmailFormComponent
     */
    private fetchEmailTemplates(keyword?: string, nextPage?: boolean, searchIn: string = 'slug'): void {
        this.fetchTemplateListInprogress.emit(true);
        this.emailTemplateParams.keyword = keyword ?? this.selectEmailTemplateEvent?.getValue() ?? '';
        const payload = {
            url: `${this.emailUrl}/templates`,
            params: {
                page: this.emailTemplateParams.page,
                keyword: this.emailTemplateParams.keyword,
                search_in: searchIn,
                with: 'activeVersion',
                status_id: 2, // For Approved Templates
            },
        };
        if (this.fromAdminPanel) {
            const options = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': this.adminAuthToken ?? '',
                },
                withCredentials: false,
            };
            payload['options'] = options;
            if (this.selectedUser) {
                payload.params['panel_user_id'] = this.selectedUser;
            }
        }
        this.sharedService.getEmailTemplate(payload).subscribe(
            (res) => {
                this.formatTemplateResponse(res, nextPage);
            },
            (error: any) => {
                this.fetchTemplateListInprogress.emit(false);
                this.toast.error(
                    error?.errors?.[0] || error?.errors?.permission?.[0] || error?.message || 'Something went wrong.'
                );
            }
        );
    }

    private formatTemplateResponse(res, nextPage?: boolean): void {
        let data = res.data.data;
        if (this.fetchVerifiedTemplate) {
            data = data.filter((e) => e.active_version.status_id === 2);
        }
        const formattedResponse = data.map((template) => ({
            template_id: template.id,
            slug: template.slug,
            name: template.active_version.name,
            variables: template.active_version.variables,
        }));
        if (nextPage) {
            // Load more case
            this.templates.push(...formattedResponse);
        } else {
            // Either data is searched or pre-filled from API response
            this.templates = formattedResponse;
        }
        this.emailTemplateParams.last_page = res.data.last_page;
        this.fetchTemplateListInprogress.emit(false);
        this.returnTemplateList.emit(this.templates);
        this.selectTemplate(this.selectEmailTemplateEvent?.getValue());
        this.cdr.detectChanges();
    }
}
