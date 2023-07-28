import { ComposeService } from '@msg91/services/msg91/compose';
import { BaseComponent } from '@msg91/ui/base-component';
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { fromEvent, Observable, of } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CustomValidators } from '@msg91/custom-validator';
import { IGetAllPhoneBookResModel } from '@msg91/models/segmento-models';

@Component({
    selector: 'msg91-phonebook-autocomplete',
    templateUrl: './phonebook-autocomplete.component.html',
    styleUrls: ['./phonebook-autocomplete.component.scss'],
})
export class PhonebookAutocompleteComponent extends BaseComponent implements AfterViewInit, OnInit, OnChanges {
    @Input() phonebookForm: UntypedFormControl;
    @Input() isRequired: boolean;
    /** True, if required asterisk needs to be shown in field */
    @Input() showRequiredAsterisk = false;
    /** True, if Phonebook list needs to be reloaded (required when new campaign are created) */
    @Input() reloadPhonebooks: boolean;
    @Output() phonebookSelected: EventEmitter<boolean> = new EventEmitter();
    @Output() fetchPhonebookInProgressEmit: EventEmitter<Observable<boolean>> = new EventEmitter();
    @Output() minimizeEvent: EventEmitter<boolean> = new EventEmitter();
    @Output() fullScreenMailCompose: EventEmitter<boolean> = new EventEmitter();
    @ViewChild('phonebookInput') public phonebookInput: ElementRef;
    public phonebooks$: Observable<IGetAllPhoneBookResModel[]> = of([]);
    public phonebooks: IGetAllPhoneBookResModel[] = [];
    public optionSelected = false;
    public showClose = false;

    /**
     * Returns true if control has required validator
     *
     * @readonly
     * @type {boolean}
     * @memberof PhonebookAutocompleteComponent
     */
    public get hasRequiredValidator(): boolean {
        return this.phonebookForm?.hasValidator(Validators.required);
    }

    constructor(private composeService: ComposeService, private router: Router) {
        super();
    }

    public phonebookDisplayFunction(phonebook: IGetAllPhoneBookResModel): string {
        return phonebook?.name;
    }

    ngOnInit(): void {
        if (this.phonebookForm.value?.name) {
            this.showClose = true;
        }
        setTimeout(() => {
            this.fetchPhonebook({});
        }, 0);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes.reloadPhonebooks &&
            changes.reloadPhonebooks.previousValue !== changes.reloadPhonebooks.currentValue &&
            changes.reloadPhonebooks.currentValue
        ) {
            this.fetchPhonebook({});
        }
        if (changes.phonebookForm.currentValue?.value?.id) {
            this.optionSelected = true;
            this.showClose = true;
        }
    }

    ngAfterViewInit() {
        fromEvent(this.phonebookInput.nativeElement, 'input')
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
                this.phonebooks$ = of(
                    this.phonebooks.filter((obj) =>
                        obj?.name?.toLowerCase().includes(event?.target?.value?.toLowerCase())
                    )
                );
                if (this.optionSelected) {
                    this.phonebookSelected.emit(false);
                    this.optionSelected = false;
                }
            });
    }

    public clearPhonebook(): void {
        this.showClose = false;
        this.phonebookForm.setValue('');
        this.phonebookSelected.emit(false);
        this.optionSelected = false;
        this.phonebooks$ = of(this.phonebooks);
    }

    public fetchPhonebook(params: any): void {
        this.fetchPhonebookInProgressEmit.emit(of(true));
        this.composeService
            .getAllPhoneBook(params)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (
                        response.status === 'fail' &&
                        typeof response.errors === 'string' &&
                        response.errors?.toLowerCase()?.includes('unauthorized')
                    ) {
                        this.phonebooks$ = of([]);
                        this.phonebooks = [];
                        this.registerOnSegmento();
                        this.fetchPhonebookInProgressEmit.emit(of(false));
                        return;
                    }
                    this.phonebooks$ = of(response.data);
                    this.phonebooks = response.data;
                    this.phonebookForm.setValidators([
                        CustomValidators.elementExistsInList(
                            this.phonebooks.map((obj) => obj.id),
                            'id'
                        ),
                        Validators.required,
                    ]);
                    this.fetchPhonebookInProgressEmit.emit(of(false));
                },
                error: (errors: any) => {
                    this.fetchPhonebookInProgressEmit.emit(of(false));
                },
            });
    }
    /**
     *  Navigate to segmento for create segment
     * @memberof SegmentsAutocompleteComponent
     */
    public navigateToCreatePhonebook(): void {
        this.router.navigate(
            [
                'm',
                'l',
                {
                    outlets: {
                        primary: ['segmento', 'book', this.phonebooks[0]?.id, 'contacts'],
                        navigationRouter: ['segmento'],
                    },
                },
            ],
            {
                queryParams: {
                    isPhonebookCreate: true,
                },
            }
        );
        this.minimizeEvent.emit(true);
        this.fullScreenMailCompose.emit(false);
    }

    /**
     * Phonebook selection handler
     *
     * @param {*} value Selected phonebook value
     * @memberof PhonebookAutocompleteComponent
     */
    public handlePhonebookSelection(value: any): void {
        if (!value) {
            this.showClose = false;
            this.navigateToCreatePhonebook();
        } else {
            this.phonebookForm.markAsDirty();
            this.phonebookSelected.emit(true);
            this.optionSelected = true;
            this.showClose = true;
        }
    }

    public setPhonebookControlValue(value: any) {
        if (!this.phonebookForm.value?.id) {
            setTimeout(() => {
                this.phonebookForm.setValue(value);
                this.phonebookForm.markAsDirty();
                this.handlePhonebookSelection(value);
            });
        }
    }

    /**
     * Registers segmento
     *
     * @memberof PhonebookAutocompleteComponent
     */
    public registerOnSegmento(): void {
        this.composeService.segmentoRegisterUser().subscribe();
    }
}
