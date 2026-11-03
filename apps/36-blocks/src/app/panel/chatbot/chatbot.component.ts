import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-chatbot',
    imports: [],
    template: `<div class="page-heading">
        <div>
            <span class="page-kicker">WORKSPACE ASSISTANT</span>
            <h1>Assistant</h1>
            <p>Help for the current workspace. Availability depends on your configured integration.</p>
        </div>
        <a href="https://developers.36blocks.com">Developer documentation ↗</a>
    </div>`,
})
export class ChatbotComponent {}
