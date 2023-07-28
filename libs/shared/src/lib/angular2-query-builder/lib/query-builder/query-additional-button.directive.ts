import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[queryAdditionalButton]' })
export class QueryAdditionalButtonDirective {
    constructor(public template: TemplateRef<any>) {}
}
