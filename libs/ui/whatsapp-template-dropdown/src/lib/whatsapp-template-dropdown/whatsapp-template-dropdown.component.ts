import { UntypedFormControl } from '@angular/forms';
import { BaseComponent } from '@msg91/ui/base-component';
import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { IWhatsAppClientTemplatesRespModel } from '@msg91/models/whatsapp-models';
import { Observable, of } from 'rxjs';
import { FlowService } from '@msg91/service';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
@Component({
    selector: 'msg91-whatsapp-template-dropdown',
    templateUrl: './whatsapp-template-dropdown.component.html',
})
export class WhatsappTemplateDropDownComponent extends BaseComponent implements OnChanges {
    @Input() templateForm: UntypedFormControl;
    @Input() appearance = 'outline';
    @Input() fetchTemplates: { integratedNumber: string; URL: string; fetchSyncData: boolean };

    @Output() templateSelected: EventEmitter<any> = new EventEmitter();
    @Output() fetchTemplateInProgressEmit: EventEmitter<any> = new EventEmitter();
    @Output() templatesListEmit: EventEmitter<any> = new EventEmitter();
    public templates$: Observable<IWhatsAppClientTemplatesRespModel[]> = of([]);
    public apiInProgress: boolean = false;

    constructor(private flowService: FlowService, private cdr: ChangeDetectorRef, private toast: PrimeNgToastService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.fetchTemplates && this.fetchTemplates?.integratedNumber) {
            this.fetchTemplateInProgressEmit.emit(of(true));
            this.fetchTemplate();
        }
    }

    public fetchTemplate(): void {
        if (this.apiInProgress) {
            return;
        }
        this.apiInProgress = true;
        this.flowService.getTemplateDetails(this.fetchTemplates.URL, this.fetchTemplates.integratedNumber).subscribe({
            next: (response) => {
                this.templates$ = this.handleTemplatesResponse(response.data);
                this.fetchTemplateInProgressEmit.emit(of(false));
                this.templatesListEmit.emit(this.templates$);
                this.templateSelected.emit(false);
                this.cdr.detectChanges();
                this.apiInProgress = false;
            },
            error: (error: any) => {
                this.fetchTemplateInProgressEmit.emit(of(false));
                this.templates$ = of([]);
                this.templatesListEmit.emit(this.templates$);
                this.toast.error(error?.errors);
                this.apiInProgress = false;
            },
        });
        if (this.fetchTemplates.fetchSyncData) {
            setTimeout(() => {
                this.flowService.fetchSyncData(this.fetchTemplates.integratedNumber).subscribe({
                    next: (response) => {
                        this.templates$ = this.handleTemplatesResponse(response.data);
                        this.templatesListEmit.emit(this.templates$);
                        this.cdr.detectChanges();
                    },
                    error: (error: any) => {
                        this.templates$ = of([]);
                        this.templatesListEmit.emit(this.templates$);
                        this.toast.error(error?.errors);
                    },
                });
            });
        }
    }

    public handleTemplatesResponse(
        data: IWhatsAppClientTemplatesRespModel[]
    ): Observable<IWhatsAppClientTemplatesRespModel[]> {
        return of(data.filter((res) => res.languages.some((lang) => lang.status?.toLowerCase() === 'approved')));
    }
}
