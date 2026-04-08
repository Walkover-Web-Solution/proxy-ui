import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-chatbot',
    imports: [],
    template: `<p></p>`,
})
export class ChatbotComponent {}
