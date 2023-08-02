import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReplacePipe } from '@proxy/pipes/replace';
import { CONTENT_BETWEEEN_HASH_TAG_REGEX } from '@proxy/regex';

@Component({
    selector: 'proxy-email-preview',
    templateUrl: './email-preview.component.html',
    styleUrls: ['./email-preview.component.scss'],
})
export class EmailPreviewComponent implements OnChanges {
    /** Template to be shown */
    @Input() public emailTemplate: string;
    /** Mapping of variable with values, to show on the preview */
    @Input() public mappedVariableValues: { [key: string]: string };
    /** Email variable regex for the template to replace the variable with values */
    public emailVarRegex = new RegExp(CONTENT_BETWEEEN_HASH_TAG_REGEX, 'g');
    /** Formatted Email template, contains values in place of variables */
    public formattedEmailTemplate: string;
    /** Formatted variable value for template preview, required
     * as every microservice has different symbol for template variable
     */
    public formattedMappedVariableValues: { [key: string]: string };

    constructor(private replacePipe: ReplacePipe) {}

    /**
     * Formats the mapping variable as per the microservice symbol
     *
     * @param {SimpleChanges} changes Changes object
     * @memberof EmailPreviewComponent
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.emailTemplate && changes.emailTemplate.currentValue !== changes.emailTemplate.previousValue) {
            if (this.formattedMappedVariableValues) {
                this.formattedEmailTemplate = this.replacePipe.transform(
                    this.replacePipe.transform(changes.emailTemplate.currentValue, '\n', '<br />'),
                    this.formattedMappedVariableValues,
                    null
                );
            } else {
                this.formattedEmailTemplate = this.replacePipe.transform(
                    changes.emailTemplate.currentValue,
                    '\n',
                    '<br />'
                );
            }
        }
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

    /**
     * Iframe load handler, assigns the passed content to the iframe
     *
     * @param {*} iframe Iframe instance
     * @param {*} data Data to be displayed
     * @memberof EmailPreviewComponent
     */
    onIframeLoad(iframe: any, data: any): void {
        (iframe.contentDocument || iframe.contentWindow).open();
        (iframe.contentDocument || iframe.contentWindow).write(data);
    }
}
