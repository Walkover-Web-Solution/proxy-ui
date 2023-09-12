import { Directive, HostListener, Input, NgModule } from '@angular/core';

@Directive({
    selector: '[proxyRemoveCharacter]',
})
export class RemoveCharacterDirective {
    /** Array of characters to remove */
    @Input() charactersToRemove: Array<string> = ['e', '+', '-'];

    @HostListener('keydown', ['$event'])
    public handleKeyDown(event): void {
        if (this.charactersToRemove.includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}

@NgModule({
    imports: [],
    declarations: [RemoveCharacterDirective],
    exports: [RemoveCharacterDirective],
})
export class DirectivesRemoveCharacterDirectiveModule {}
