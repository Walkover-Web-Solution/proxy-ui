import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { RedirectResponseMode } from '@proxy/models/features-model';

/**
 * Lets a block choose what the post-login redirect carries: the proxy_auth_token itself
 * ('legacy') or a one-time code that the client's server exchanges for it ('code').
 *
 * The control belongs to the parent form and is saved with the block's Update button.
 * 'code' can't be chosen until the block has an active client secret, because without one
 * nothing could exchange the code; the backend enforces the same rule.
 */
@Component({
    selector: 'proxy-redirect-response-mode',
    imports: [ReactiveFormsModule, MatIconModule, MatRadioModule],
    templateUrl: './redirect-response-mode.component.html',
    styleUrls: ['./redirect-response-mode.component.scss'],
})
export class RedirectResponseModeComponent {
    @Input({ required: true }) control: FormControl<RedirectResponseMode>;

    /** Active client secrets on the block, or null until that is known. */
    @Input() activeSecretCount: number | null = null;

    /** The mode currently saved on the block. A block already on 'code' keeps the option enabled. */
    @Input() savedMode: RedirectResponseMode = 'legacy';

    public get codeDisabled(): boolean {
        return this.savedMode !== 'code' && !(this.activeSecretCount > 0);
    }

    /** Only explain the missing secret once we know there really are none. */
    public get showNoSecretHint(): boolean {
        return this.codeDisabled && this.activeSecretCount === 0;
    }
}
