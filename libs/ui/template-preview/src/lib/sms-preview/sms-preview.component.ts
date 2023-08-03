import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CONTENT_BETWEEEN_HASH_TAG_REGEX } from '@proxy/regex';

@Component({
    selector: 'proxy-sms-preview',
    templateUrl: './sms-preview.component.html',
    styleUrls: ['./sms-preview.component.scss'],
})
export class SmsPreviewComponent implements OnChanges {
    /** Sender ID of the SMS template */
    @Input() senderId: string | number;
    /** SMS template to be previewed */
    @Input() smsTemplate: string;
    /** Mapping of variable with values, to show on the preview */
    @Input() public mappedVariableValues: { [key: string]: string };

    @Input() public previewWidthClass: string = '';

    @Input() public maxHeight: string = '300px';
    /** SMS variable regex for the template to replace the variable with values */
    public smsVarRegex = new RegExp(CONTENT_BETWEEEN_HASH_TAG_REGEX, 'g');
    /** Formatted variable value for template preview, required
     * as every microservice has different symbol for template variable
     */
    public formattedMappedVariableValues: { [key: string]: string };

    /**
     * Formats the mapping variable as per the microservice symbol
     *
     * @param {SimpleChanges} changes Changes object
     * @memberof SmsPreviewComponent
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (
            changes.mappedVariableValues &&
            changes.mappedVariableValues.currentValue !== changes.mappedVariableValues.previousValue
        ) {
            this.formattedMappedVariableValues = {};
            Object.keys(this.mappedVariableValues).forEach(
                (key) =>
                    (this.formattedMappedVariableValues[`##${key}##`] = this.mappedVariableValues[key]?.length
                        ? this.mappedVariableValues[key]
                        : `##${key}##`)
            );
        }
    }
}
