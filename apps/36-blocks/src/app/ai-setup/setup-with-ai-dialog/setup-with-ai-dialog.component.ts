import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { buildBlockUpdatePrompt, maskKeyInPrompt } from '../ai-prompts';
import { AiSetupService, SetupDialogData } from '../ai-setup.service';
import { AiSetupPanelComponent } from '../ai-setup-panel/ai-setup-panel.component';
import { PROVISION_FAILURE_TEXT, SetupKeyService } from '../setup-key.service';
import { SETUP_KEY_NAME } from '../setup-key';

/**
 * "Set up with AI": the prompt for the current context plus how to connect the 36Blocks MCP server. On a block's own
 * page there is an optional, explicit action that lets the user's agent read and change that block: it finds or
 * creates the dedicated workspace key and switches to a prompt that includes it. The key lives only in this dialog.
 */
@Component({
    selector: 'proxy-setup-with-ai-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, MatButtonModule, MatDialogModule, MatIconModule, AiSetupPanelComponent],
    providers: [SetupKeyService],
    templateUrl: './setup-with-ai-dialog.component.html',
    styleUrl: './setup-with-ai-dialog.component.scss',
})
export class SetupWithAiDialogComponent {
    protected readonly data = inject<SetupDialogData>(MAT_DIALOG_DATA);
    protected readonly keys = inject(SetupKeyService);
    private readonly aiSetup = inject(AiSetupService);

    protected readonly keyName = SETUP_KEY_NAME;
    protected readonly failureText = PROVISION_FAILURE_TEXT;
    /** Only a block's own page offers it, and only when the block's reference id is usable. */
    protected readonly canEditBlock = !!this.data.context && this.data.kind === 'block';

    /** The prompt that includes the key. Memory only; dropped with the dialog. */
    private readonly keyedPrompt = signal<string | null>(null);
    protected readonly revealed = signal(false);
    protected readonly keyed = computed(() => this.keyedPrompt() !== null);
    protected readonly prompt = computed(() => this.keyedPrompt() ?? this.data.prompt);
    protected readonly shown = computed(() => {
        const keyed = this.keyedPrompt();
        if (keyed === null || this.revealed()) return this.prompt();
        return maskKeyInPrompt(keyed, this.keys.authKey() ?? '');
    });

    protected async letAiChange(): Promise<void> {
        await this.keys.prepare();
        const key = this.keys.authKey();
        if (this.keys.provision() !== 'ready' || !key || !this.data.context) return;
        const prompt = buildBlockUpdatePrompt({
            ...this.data.context,
            baseUrl: this.aiSetup.resolvedApiBaseUrl(),
            authKey: key,
        });
        if (prompt) this.keyedPrompt.set(prompt);
    }

    protected toggleReveal(): void {
        this.revealed.update((value) => !value);
    }
}
