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
} from '@angular/core';
import { fromEvent, Observable, of } from 'rxjs';
import { FlowService } from '@msg91/service';
import { UntypedFormControl } from '@angular/forms';
import { IPaginationVoiceResponse } from '@msg91/models/voice-models';

@Component({
    selector: 'msg91-voice-template-dropdown',
    templateUrl: './voice-template-dropdown.component.html',
})
export class VoiceTemplateDropdownComponent extends BaseComponent implements OnInit, AfterViewInit {
    @Input() templateForm: UntypedFormControl;
    @Input() createTemplateURL: string;
    @Input() formFieldAppearance: string = 'outline';

    @Output() templateSelected: EventEmitter<boolean> = new EventEmitter();
    @Output() selectedTemplateData: EventEmitter<any> = new EventEmitter();
    @Output() fetchTemplateInProgressEmit: EventEmitter<Observable<boolean>> = new EventEmitter();
    @Output() templatesListEmit: EventEmitter<Observable<IPaginationVoiceResponse<any[]> | any>> = new EventEmitter();

    @ViewChild('voiceTemplateInput') public voiceTemplateInput: ElementRef;

    public templates$: Observable<IPaginationVoiceResponse<any[]> | any> = of([]);
    public hasNextPage: boolean;
    public showCloseTemplate = false;
    public params: { [key: string]: any } = { page_num: 1 };

    constructor(private flowService: FlowService, private cdr: ChangeDetectorRef) {
        super();
    }

    public templateDisplayFunction(template: { id: number; name: string; structure: any[] }): string {
        return template?.name;
    }

    ngOnInit(): void {
        if (this.templateForm.value?.name) {
            this.showCloseTemplate = true;
            this.params = {
                page_num: 1,
                name: this.templateForm.value?.name,
            };
        }
        this.fetchTemplate(this.params);
    }

    ngAfterViewInit() {
        fromEvent(this.voiceTemplateInput.nativeElement, 'input')
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
                this.params = {
                    page_num: 1,
                    name: event?.target?.value,
                };
                this.fetchTemplate(this.params);
            });
    }

    public refreshTemplate(): void {
        this.templates$ = of([]);
        this.params = {
            page_num: 1,
            ...(this.templateForm.value?.name && { name: this.templateForm.value.name }),
        };
        this.fetchTemplate(this.params);
    }

    public fetchNextTemplatePage(): void {
        if (this.hasNextPage) {
            this.params = {
                ...this.params,
                page_num: this.params.page_num + 1,
            };
            this.fetchTemplate(this.params, true);
        }
    }

    public clearTemplate(): void {
        this.showCloseTemplate = false;
        this.templateForm.setValue('');
        delete this.params['name'];
        this.params['page_num'] = 1;
        this.fetchTemplate(this.params);
    }

    public fetchTemplate(params: any, nextPage?: boolean): void {
        this.fetchTemplateInProgressEmit.emit(of(true));
        this.flowService.getVoiceTemplates(params).subscribe(
            (response) => {
                if (nextPage) {
                    this.templates$.pipe(take(1)).subscribe((temp) => {
                        this.templates$ = of(temp.concat(response.data.data));
                    });
                } else {
                    this.templates$ = of(response.data.data);
                }
                if (this.templateForm.value?.name) {
                    this.templateForm.setValue(
                        response.data.data.find((obj) => obj.name === this.templateForm.value?.name)
                    );
                }
                this.hasNextPage = response.data.count > response.data.page_num * response.data.page_size;
                this.fetchTemplateInProgressEmit.emit(of(false));
                this.templatesListEmit.emit(this.templates$);
                this.templateSelected.emit(false);
                this.cdr.detectChanges();
            },
            (errors: any) => {
                this.fetchTemplateInProgressEmit.emit(of(false));
            }
        );
    }

    public selectedTemplate(): void {
        const data = {
            ...this.templateForm.value,
            variables: this.templateForm.value.structure.filter((e) => e.type === 'var').map((e) => e.value),
        };
        this.templateForm.setValue(data);
        this.selectedTemplateData.emit(data);
    }

    public handleTemplateSelection() {
        this.templateForm.markAsDirty();
        this.templateSelected.emit(true);
        this.showCloseTemplate = true;
        this.selectedTemplate();
    }
}
