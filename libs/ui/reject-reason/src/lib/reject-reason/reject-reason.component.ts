import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormControl, FormRecord, ValidatorFn } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';

export interface RejectFormField {
    name: string;
    placeholder?: string;
    type: string;
    data?: { [key: string]: any };
    validations: Array<ValidatorFn>;
}

export type RejectForm = Array<RejectFormField>;

export interface RejectButtons {
    name: string;
    class?: string;
    data?: { [key: string]: string };
}
export interface NewRejectReason {
    form: RejectForm;
}
export interface SearchRejectReason {
    placeholder: string;
    emitOnEnter: boolean;
}
export interface RejectReasonConfiguration {
    newReason: NewRejectReason;
    searchReason: SearchRejectReason;
}
@Component({
    selector: 'proxy-reject-reason',
    templateUrl: './reject-reason.component.html',
    styleUrls: ['./reject-reason.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectReasonComponent implements OnInit, OnChanges {
    /** Configuration to initialize form */
    @Input() public configuration: RejectReasonConfiguration;
    /** True, if add new reason option needs to be shown */
    @Input() public showAddReason: boolean;
    /** Stores the list of all the rejection reasons */
    @Input() public rejectionReasons: Array<any>;
    /** True, if rejection API is in progress */
    @Input() public isLoading: boolean;
    /** Stores the selected reason */
    @Input() public selectedReason: any;
    /** Button text for rejection button */
    @Input() public rejectButtonTxt = 'Reject & Next';
    /** True, if rejection is created successfully */
    @Input() public resetForm: boolean;
    @Input() public matMenuOpen: boolean;

    /** Emits when menu is closed */
    @Output() public closeMenu: EventEmitter<void> = new EventEmitter();
    /** Show add reason output emitter for two-way binding */
    @Output() public showAddReasonChange: EventEmitter<boolean> = new EventEmitter();
    /** Add new reason event */
    @Output() public addNewReason: EventEmitter<any> = new EventEmitter();
    /** Cancel new reason event */
    @Output() public cancelNewReason: EventEmitter<any> = new EventEmitter();
    /** Search event of rejection reason */
    @Output() public searched: EventEmitter<string> = new EventEmitter();
    /** Delete reason event */
    @Output() public reasonDeleted: EventEmitter<any> = new EventEmitter();
    /** Reject event */
    @Output() public rejectAndNext: EventEmitter<any> = new EventEmitter();
    /** Selected reason output emitter for two-way binding */
    @Output() public selectedReasonChange: EventEmitter<any> = new EventEmitter();

    /** New reason form group instance */
    public addReasonForm: FormRecord<FormControl<string | null>>;

    constructor(private dialog: MatDialog) {}

    /**
     * Initializes the form
     *
     * @memberof RejectReasonComponent
     */
    public ngOnInit(): void {
        if (this.configuration?.newReason?.form) {
            this.addReasonForm = new FormRecord<FormControl<string | null>>({});
            const formInstance = this.configuration?.newReason?.form;
            formInstance.forEach((field) => {
                this.addReasonForm.addControl(field.name, new FormControl('', field.validations));
            });
        }
    }

    /**
     * Resets the form once API succeeds
     *
     * @param {SimpleChanges} changes
     * @memberof RejectReasonComponent
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.resetForm?.currentValue) {
            this.addReasonForm.reset();
            this.setAddReason(false);
        }
    }

    /**
     * Delete reason handler
     *
     * @param {*} reason Reason to be deleted
     * @memberof RejectReasonComponent
     */
    public onDelete(reason: any): void {
        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent);
        const componentInstance = dialogRef.componentInstance;
        componentInstance.confirmationMessage = `Are you sure to delete this reason?`;
        componentInstance.confirmButtonText = 'Delete';
        dialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                this.reasonDeleted.emit({ request: reason?.id });
            }
        });
    }

    /**
     * Cancels the addition of new reason and resets the form
     *
     * @memberof RejectReasonComponent
     */
    public cancelNewReasonAndReset(): void {
        this.setAddReason(false);
        this.cancelNewReason.emit();
        this.addReasonForm.reset();
    }

    /**
     * Sets the add reason form
     * @param {boolean} value Value to be set
     */
    public setAddReason(value: boolean): void {
        this.showAddReason = value;
        this.showAddReasonChange.emit(this.showAddReason);
    }
}
