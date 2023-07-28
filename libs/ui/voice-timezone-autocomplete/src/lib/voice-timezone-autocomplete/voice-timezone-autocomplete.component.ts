import { BaseComponent } from '@msg91/ui/base-component';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, ValidatorFn } from '@angular/forms';
import { fromEvent, takeUntil, BehaviorSubject } from 'rxjs';
import { FlowService } from '@msg91/service';
import { CustomValidators } from '@msg91/custom-validator';

@Component({
    selector: 'msg91-voice-timezone-autocomplete',
    templateUrl: './voice-timezone-autocomplete.component.html',
})
export class VoiceTimezoneAutocompleteComponent extends BaseComponent implements AfterViewInit, OnInit {
    @Input() timezoneFormControl: FormControl<string>;
    @Input() label = 'Timezone';
    @Input() placeholder = 'Select Timezone';
    @Input() appearance = 'outline';
    /** True, if required asterisk needs to be shown in field */
    @Input() showRequiredAsterisk = false;
    @ViewChild('timezoneInput') public timezoneInput: ElementRef;
    public timezones$ = new BehaviorSubject<string[]>([]);
    public timezones: string[] = [];
    public fetchingTimezones = new BehaviorSubject<boolean>(false);
    public existInListValidator: ValidatorFn;

    constructor(private flowService: FlowService) {
        super();
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.fetchTimezone();
        }, 0);
    }

    ngAfterViewInit() {
        fromEvent(this.timezoneInput.nativeElement, 'input')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: any) => {
                if (event?.target?.value) {
                    this.timezones$.next(
                        this.timezones.filter((value) =>
                            value.toLowerCase().includes(event?.target?.value?.toLowerCase())
                        )
                    );
                } else {
                    this.resetTimezoneList();
                }
            });
    }

    public clearTimezone(): void {
        this.timezoneFormControl.setValue('');
        this.resetTimezoneList();
    }

    public resetTimezoneList(): void {
        this.timezones$.next(this.timezones);
    }

    public fetchTimezone(): void {
        this.fetchingTimezones.next(true);
        this.flowService.getAllTimezones().subscribe({
            next: (response) => {
                if (response?.hasError) {
                    this.timezones$.next([]);
                    this.timezones = [];
                } else {
                    this.timezones$.next(response.data);
                    this.timezones = response.data;
                    if (this.existInListValidator) {
                        this.timezoneFormControl.removeValidators(this.existInListValidator);
                    }
                    this.existInListValidator = CustomValidators.elementExistsInList(this.timezones);
                    this.timezoneFormControl.addValidators(this.existInListValidator);
                }
                this.fetchingTimezones.next(false);
            },
            error: (errors: any) => {
                this.fetchingTimezones.next(false);
            },
        });
    }
}
