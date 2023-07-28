import { FormControl } from '@angular/forms';
import { BaseComponent } from '@msg91/ui/base-component';
import {
    Component,
    EventEmitter,
    Input,
    Output,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    AfterViewInit,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { debounceTime, fromEvent, Observable, of, takeUntil, tap } from 'rxjs';
import { INotificationTemplateData } from '@msg91/models/notifications-models';
import { NotificationServices } from '@msg91/services/msg91/notifications';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { cloneDeep, uniqBy } from 'lodash-es';
import { DEBOUNCE_TIME } from '@msg91/constant';
@Component({
    selector: 'msg91-notification-template-autocomplete',
    templateUrl: './notification-template-autocomplete.component.html',
})
export class NotificationTemplateDropDownComponent extends BaseComponent implements OnChanges, AfterViewInit {
    @Input() templateForm: FormControl;
    @Input() appearance = 'outline';
    @Input() fetchTemplates: boolean;
    @Output() templateSelected: EventEmitter<any> = new EventEmitter();
    @Output() fetchTemplateInProgressEmit: EventEmitter<any> = new EventEmitter();
    @Output() templatesListEmit: EventEmitter<any> = new EventEmitter();
    @Output() createNewTemplate: EventEmitter<any> = new EventEmitter();
    @ViewChild('templateInput') public templateInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
    public templates$: Observable<INotificationTemplateData[]> = of([]);
    public showCloseTemplate: boolean = false;
    public templateParams: any = {
        page_number: 1,
        page_size: 25,
    };
    public totalTemplateCounts: number = 0;
    public templates: INotificationTemplateData[] = [];

    constructor(private service: NotificationServices, private cdr: ChangeDetectorRef) {
        super();
    }

    public ngAfterViewInit() {
        fromEvent(this.templateInput.nativeElement, 'input')
            .pipe(debounceTime(DEBOUNCE_TIME), takeUntil(this.destroy$))
            .subscribe((event: any) => {
                this.refetchTemplates(event?.target?.value);
            });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes?.fetchTemplates) {
            this.fetchTemplateInProgressEmit.emit(of(true));
            this.fetchTemplate(this.templateParams, true);
        }
    }

    public templateDisplayFunction(template: { name: string }): string {
        return template?.name;
    }

    public fetchNextTemplatePage(): void {
        if (this.templateParams.page_number * this.templateParams.page_size < this.totalTemplateCounts) {
            this.templateParams = {
                ...this.templateParams,
                page_number: this.templateParams.page_number + 1,
            };
            this.fetchTemplate(this.templateParams);
        }
    }

    public fetchTemplate(params: any, reload?: boolean): void {
        this.service.getClientTemplate(params).subscribe((response) => {
            if (reload) {
                this.templates = response.data.template_data;
            } else {
                this.templates = cloneDeep(uniqBy([...this.templates, ...response.data.template_data], 'template_id'));
            }
            this.templates$ = of(this.templates);
            this.totalTemplateCounts = response.data.total_template_count;
            this.fetchTemplateInProgressEmit.emit(of(false));
            this.templatesListEmit.emit(this.templates$);
            this.templateSelected.emit(false);
            this.cdr.detectChanges();
        });
    }

    /**
     * Refetches the template on searching of template
     *
     * @param {string} [value=''] Searched template text
     * @memberof NotificationTemplateDropDownComponent
     */
    public refetchTemplates(value: string = ''): void {
        this.templateParams.keyword = value;
        this.templates = [];
        this.templateParams.page_number = 1;
        this.fetchTemplate(this.templateParams, true);
    }
}
