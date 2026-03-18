import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    effect,
    inject,
    input,
    output,
    ChangeDetectorRef,
} from '@angular/core';
import { FormControl, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { KeyValuePipe } from '@angular/common';
import { RemoveCharacterDirective } from '@proxy/directives/RemoveCharacterDirective';
import { DEBOUNCE_TIME } from '@proxy/constant';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'proxy-lib-search',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        KeyValuePipe,
        RemoveCharacterDirective,
    ],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
    type = input<string>('text');
    value = input<string>();
    /**
     * placeholder for input.
     * string
     */
    placeholder = input<string>('');
    hideCloseIcon = input<boolean>(false);
    /**
     * validators (angular mat form supported Validators class members)
     * Validators[]
     */
    validators = input<ValidatorFn[]>();
    toolTipString = input<string>('');
    toolTipPosition = input<TooltipPosition>('above');
    toolTipDisable = input<boolean>(false);
    inputDisabled = input<boolean>();
    matFormFieldClass = input<string>('');
    formErrors = input<{ [key: string]: string }>();
    isRemoveChar = input<boolean>();
    charactersToRemove = input<Array<string>>();
    emitOnEnter = input<boolean>(false);
    hint = input<string>(null);

    inputChanges = output<string>();

    private cdr = inject(ChangeDetectorRef);
    public searchFormControl = new FormControl<string>('');

    constructor() {
        effect(() => {
            const v = this.validators();
            if (v && Array.isArray(v)) {
                this.searchFormControl.setValidators(v);
            } else {
                this.searchFormControl.setValidators([]);
            }
            this.searchFormControl.updateValueAndValidity();
        });

        effect(() => {
            const disabled = this.inputDisabled();
            if (disabled !== undefined) {
                if (disabled && this.searchFormControl.enabled) {
                    this.searchFormControl.disable();
                } else if (!disabled && this.searchFormControl.disabled) {
                    this.searchFormControl.enable();
                }
            }
        });

        effect(() => {
            const val = this.value();
            if (val !== undefined && val !== this.searchFormControl.value) {
                this.searchFormControl.setValue(val);
                this.searchFormControl.markAsDirty();
            }
        });
    }

    public ngOnInit(): void {
        if (!this.emitOnEnter()) {
            this.searchFormControl.valueChanges.pipe(debounceTime(DEBOUNCE_TIME)).subscribe((res) => {
                this.emitInputChanges(res);
            });
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
        if (this.emitOnEnter()) {
            this.emitInputChanges('');
        }
    }
}
