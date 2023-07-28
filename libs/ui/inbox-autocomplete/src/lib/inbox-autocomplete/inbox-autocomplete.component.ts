import { ComposeService } from '@msg91/services/msg91/compose';
import { BaseComponent } from '@msg91/ui/base-component';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { fromEvent, Observable, of } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CustomValidators } from '@msg91/custom-validator';
import { IInboxData } from '@msg91/models/segmento-models';

@Component({
    selector: 'msg91-inbox-autocomplete',
    templateUrl: './inbox-autocomplete.component.html',
    styleUrls: ['./inbox-autocomplete.component.scss'],
})
export class InboxAutocompleteComponent extends BaseComponent implements OnInit, AfterViewInit {
    @Input() inboxForm: UntypedFormControl;
    @Input() appearance = 'outline';
    @Input() label: string = 'Inbox';
    @Input() isRequired: boolean = false;
    @Input() labelFloat: boolean = true;
    @Output() inboxSelected: EventEmitter<boolean> = new EventEmitter();
    @Output() fetchInboxInProgressEmit: EventEmitter<Observable<boolean>> = new EventEmitter();
    @ViewChild('inboxInput') public inboxInput: ElementRef;
    public inboxes$: Observable<IInboxData[]> = of([]);
    public inboxes: IInboxData[] = [];
    public optionSelected = false;
    public showClose = false;
    public params = {
        agent_inboxes: true,
        start_from: 1,
        page_size: 20,
        search: '',
    };

    constructor(private composeService: ComposeService, private cdr: ChangeDetectorRef) {
        super();
    }

    public inboxDisplayFunction(inbox: IInboxData): string {
        return inbox?.name;
    }

    public ngOnInit(): void {
        if (this.inboxForm.value?.name) {
            this.showClose = true;
        }
        setTimeout(() => {
            this.fetchInbox(this.params);
        }, 0);
    }

    public ngAfterViewInit() {
        fromEvent(this.inboxInput.nativeElement, 'input')
            .pipe(
                tap((event: any) => {
                    if (event?.target?.value) {
                        this.showClose = true;
                    } else {
                        this.showClose = false;
                    }
                }),
                takeUntil(this.destroy$)
            )
            .subscribe((event: any) => {
                this.params = {
                    ...this.params,
                    search: event?.target?.value,
                };
                this.fetchInbox(this.params);
                if (this.optionSelected) {
                    this.inboxSelected.emit(false);
                    this.optionSelected = false;
                }
            });
    }

    public handelInboxSelection(): void {
        this.inboxForm.markAsDirty();
        this.inboxSelected.emit(true);
        this.optionSelected = true;
        this.showClose = true;
    }

    public clearInbox(): void {
        this.showClose = false;
        this.inboxForm.setValue('');
        this.inboxSelected.emit(false);
        this.optionSelected = false;
        this.params = {
            ...this.params,
            search: '',
        };
        this.fetchInbox(this.params);
    }

    public fetchInbox(params: any): void {
        this.fetchInboxInProgressEmit.emit(of(true));
        this.composeService
            .getAllInboxes(params)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (response) => {
                    this.inboxes$ = of(response.data.inboxes_list);
                    this.inboxes = response.data.inboxes_list;
                    this.inboxForm.setValidators([
                        Validators.required,
                        CustomValidators.elementExistsInList(
                            this.inboxes.map((obj) => obj.id),
                            'id'
                        ),
                    ]);
                    this.fetchInboxInProgressEmit.emit(of(false));
                    this.cdr.detectChanges();
                },
                (errors: any) => {
                    this.fetchInboxInProgressEmit.emit(of(false));
                }
            );
    }
}
