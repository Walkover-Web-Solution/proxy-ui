import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
    IWhatsappTemplate,
    IWhatsappTemplateButtonFormat,
    IWhatsappTemplateHeaderFormat,
    IWhatsappTemplateMessageType,
} from '@proxy/models/whatsapp-models';
import { CONTENT_BETWEEEN_CURLY_BRACKETS_REGEX } from '@proxy/regex';

@Component({
    selector: 'proxy-whatsapp-preview',
    templateUrl: './whatsapp-preview.component.html',
    styleUrls: ['./whatsapp-preview.component.scss'],
})
export class WhatsappPreviewComponent implements OnChanges {
    /** Whatsapp template data */
    @Input() public whatsappTemplate: Array<IWhatsappTemplate> = [];
    /** Placeholder image for the template */
    @Input() public imagePlaceholder: string;
    /** Placeholder image for the template */
    @Input() public videoPlaceholder: string;
    /** Placeholder image for the template */
    @Input() public documentPlaceholder: string;
    /** Whatsapp variable regex for the template to replace the variable with values */
    @Input() public mappedVariableValues: { [key: string]: string };
    /** Card and button theme changes */
    @Input() public cardThemeClass: string;
    /** Template message types */
    public templateMessageType = IWhatsappTemplateMessageType;
    /** Template header types */
    public templateHeaderFormat = IWhatsappTemplateHeaderFormat;
    /** Template button types */
    public templateButtonFormat = IWhatsappTemplateButtonFormat;
    /** Whatsapp variable regex for the template to replace the variable with values */
    public whatsappVarRegex = new RegExp(CONTENT_BETWEEEN_CURLY_BRACKETS_REGEX, 'g');
    /** Formatted variable value for template preview, required
     * as every microservice has different symbol for template variable
     */
    public formattedMappedVariableValues: { [key: string]: string };

    /**
     * Formats the mapping variable as per the microservice symbol
     *
     * @param {SimpleChanges} changes Changes object
     * @memberof WhatsappPreviewComponent
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (
            changes.mappedVariableValues &&
            changes.mappedVariableValues.currentValue !== changes.mappedVariableValues.previousValue &&
            this.mappedVariableValues
        ) {
            this.formattedMappedVariableValues = {};
            Object.keys(this.mappedVariableValues).forEach(
                (key) =>
                    (this.formattedMappedVariableValues[`{{${key}}}`] = this.mappedVariableValues[key]?.length
                        ? this.mappedVariableValues[key]
                        : `{{${key}}}`)
            );
        }
    }
}
