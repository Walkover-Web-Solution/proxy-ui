import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'proxy-phone-recording',
    templateUrl: './phone-recording.component.html',
    styleUrls: ['./phone-recording.component.scss'],
})
export class PhoneRecordingComponent {
    /** Call form group */
    public callForm: UntypedFormGroup;
    /** Stores the current phone recording progress */
    @Input() public phoneRecordInProcess: boolean;
    /** Stores the phone record error */
    @Input() public phoneRecordError: string;
    /** Emits when phone recording needs to be started */
    @Output() public recordPhone: EventEmitter<any> = new EventEmitter();

    constructor(private formBuilder: UntypedFormBuilder) {
        this.callForm = this.formBuilder.group({
            filename: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9]+_)*[a-zA-Z0-9]+$/)]],
            number: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
        });
    }

    /**
     * Starts the phone recording
     *
     * @memberof PhoneRecordingComponent
     */
    phoneRec(): void {
        this.recordPhone.emit(this.callForm.value);
    }
}
