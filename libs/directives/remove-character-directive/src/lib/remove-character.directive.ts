import { Directive, input } from '@angular/core';

@Directive({
    selector: '[proxyRemoveCharacter]',
    host: {
        '(keydown)': 'handleKeyDown($event)',
    },
})
export class RemoveCharacterDirective {
    /** Array of characters to remove */
    charactersToRemove = input<Array<string>>(['e', '+', '-']);

    public handleKeyDown(event): void {
        if (this.charactersToRemove().includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}
