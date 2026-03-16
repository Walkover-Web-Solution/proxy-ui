import {
    Component,
    OnInit,
    Input,
    EventEmitter,
    Output,
    ChangeDetectionStrategy,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';
import { DEBOUNCE_TIME } from '@proxy/constant';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'proxy-lib-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit, OnChanges {
    @Input() type = 'text';
    @Input() value: string;
    /**
     * placeholder for input.
     * string
     */
    @Input() placeholder = '';
    @Input() hideCloseIcon: boolean = false;
    /**
     * validators (angular mat form supported Validators class members)
     * Validators[]
     */
    @Input() validators: Validators[];
    @Input() toolTipString = '';
    @Input() toolTipPosition: TooltipPosition = 'above';
    @Input() toolTipDisable = false;
    @Input() inputDisabled: boolean;
    @Input() matFormFieldClass = '';
    @Input() formErrors: { [key: string]: string };
    @Input() isRemoveChar: boolean;
    @Input() charactersToRemove: Array<string>;
    @Input() emitOnEnter = false;
    @Input() hint: string = null;

    @Output() inputChanges: EventEmitter<string> = new EventEmitter();

    public searchFormControl = new UntypedFormControl('');

    public ngOnInit(): void {
        if (!this.emitOnEnter) {
            this.searchFormControl.valueChanges.pipe(debounceTime(DEBOUNCE_TIME)).subscribe((res) => {
                this.emitInputChanges(res);
            });
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes?.validators?.currentValue && Array.isArray(changes?.validators.currentValue)) {
            this.searchFormControl.setValidators(changes?.validators.currentValue);
            this.searchFormControl.updateValueAndValidity();
        } else {
            if (Array.isArray(changes?.validators?.previousValue) && !changes?.validators?.currentValue) {
                this.searchFormControl.setValidators([]);
                this.searchFormControl.updateValueAndValidity();
            }
        }
        if (changes?.inputDisabled?.currentValue !== undefined) {
            if (changes?.inputDisabled?.currentValue && this.searchFormControl.enabled) {
                this.searchFormControl.disable();
            } else if (!changes?.inputDisabled?.currentValue && this.searchFormControl.disabled) {
                this.searchFormControl.enable();
            }
        }
        if (changes?.value?.currentValue !== undefined) {
            if (changes?.value?.currentValue !== this.searchFormControl?.value) {
                this.searchFormControl.setValue(changes?.value?.currentValue);
                this.searchFormControl.markAsDirty();
            }
        }
    }

    private emitInputChanges(res: string) {
        if (this.searchFormControl.dirty) {
            this.inputChanges.emit(res);
        }
    }

    /** clear search on close icon click */
    public clearSearch(): void {
        this.searchFormControl.setValue('');
        if (this.emitOnEnter) {
            this.emitInputChanges('');
        }
    }
}
