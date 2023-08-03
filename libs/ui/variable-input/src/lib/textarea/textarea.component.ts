import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HighlightTag } from 'angular-text-input-highlight';
import { MentionConfig } from '@proxy/ui/angular-mentions';
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
    selector: 'proxy-textarea',
    templateUrl: './textarea.component.html',
    styleUrls: ['./textarea.component.scss'],
})
export class TextareaComponent implements OnChanges {
    @Input() public rows = '4';
    @Input() public label = 'Textarea';
    @Input() public placeholder = '';
    @Input() public hint = '';
    @Input() public formFieldAppearance: MatFormFieldAppearance = 'outline';
    @Input() public textareaFormControl: FormControl<string>;
    @Input() public variableTriggerChar: string = '#';
    @Input() public showSuggestions: boolean = false;
    @Input() public showRequiredAsterisk = false;

    // Provide either higlightRegex or fixedHighlightList
    @Input() public higlightRegex: string;
    @Input() public fixedHighlightList: string[] = null;

    @Input() public checkValue = false;
    @Output() public checkValueChange = new EventEmitter<boolean>();

    public tags: HighlightTag[] = [];
    public mentionConfig: MentionConfig = { mentions: [] };

    constructor(private _cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.fixedHighlightList?.currentValue?.length) {
            this.higlightRegex = '\\B' + this.variableTriggerChar + `(${this.fixedHighlightList.join('|')})` + '\\b';
            if (this.showSuggestions) {
                this.mentionConfig = {
                    mentions: [
                        {
                            items: this.fixedHighlightList,
                            triggerChar: this.variableTriggerChar,
                            allowSpace: false,
                        },
                    ],
                };
            }
        }
        if (changes?.checkValue?.currentValue) {
            this.onValueChange();
            this.checkValueChange.emit(false);
        }
    }

    onValueChange() {
        if (this.higlightRegex) {
            this.tags = [];
            const vars = new RegExp(this.higlightRegex, 'gm');
            let match;
            while ((match = vars.exec(this.textareaFormControl?.value ?? ''))) {
                this.tags.push({
                    indices: {
                        start: match.index,
                        end: match.index + match[0].length,
                    },
                    cssClass: 'highlight-text',
                });
            }
            this._cdr.detectChanges();
        }
    }
}
