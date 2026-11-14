import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    computed,
    inject,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { AiPromptKind, CLI_INIT_COMMAND, MCP_SERVER_NAME, MCP_SERVER_URL } from '../ai-prompts';
import { copyText } from '../clipboard';

export type CopyState = 'idle' | 'copied' | 'failed';

const EXPLANATIONS: Record<AiPromptKind, string> = {
    general: 'Paste this into your AI coding agent. It reads the 36Blocks docs and adds sign-in to your app.',
    block: 'Paste this into your AI coding agent to integrate this existing block into your app.',
    'block-key':
        'Paste this into your AI coding agent. It reads this block through the API and changes it the way you ask.',
    setup: 'Paste this into your AI coding agent. It asks which sign-in methods you want, creates the block through the API and integrates it into your app.',
};

/**
 * The shared body of the "Set up with AI" dialogs: one-line explanation, the read-only prompt, a copy action with
 * distinct copied / failed feedback, and per-tool instructions for connecting the 36Blocks MCP server.
 */
@Component({
    selector: 'proxy-ai-setup-panel',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, MatIconModule, MatTabsModule],
    templateUrl: './ai-setup-panel.component.html',
    styleUrl: './ai-setup-panel.component.scss',
})
export class AiSetupPanelComponent {
    /** The text that is copied. May contain a workspace key (the keyed prompts), so it is never logged or stored. */
    readonly prompt = input.required<string>();
    /** The text shown on screen when it should differ from what is copied (the key masked). Defaults to `prompt`. */
    readonly displayPrompt = input<string | null>(null);
    readonly kind = input<AiPromptKind>('general');
    /** True when the prompt carries a credential: the generic "never paste secrets" footer is replaced by the caller's notice. */
    readonly sensitive = input(false);
    /** Heading and intro for the connector tabs. */
    readonly tabsHeading = input('Connect your AI tool to 36Blocks');
    /** Emits after the prompt was copied successfully. */
    readonly promptCopied = output<void>();

    private readonly destroyRef = inject(DestroyRef);
    private readonly promptField = viewChild<ElementRef<HTMLTextAreaElement>>('promptField');
    private resetTimers = new Map<string, ReturnType<typeof setTimeout>>();

    protected readonly explanation = computed(() => EXPLANATIONS[this.kind()]);
    protected readonly promptRows = computed(() => (this.sensitive() ? 12 : 7));
    protected readonly shownPrompt = computed(() => this.displayPrompt() ?? this.prompt());
    protected readonly mcpUrl = MCP_SERVER_URL;
    protected readonly cliInit = CLI_INIT_COMMAND;
    // Syntax confirmed from the tools' own documentation: Claude Code "claude mcp add --transport http <name> <url>";
    // Cursor remote servers are a { url } entry under mcpServers in .cursor/mcp.json (project) or ~/.cursor/mcp.json.
    protected readonly claudeCodeCommand = `claude mcp add --transport http ${MCP_SERVER_NAME} ${MCP_SERVER_URL}`;
    protected readonly cursorConfig = JSON.stringify(
        { mcpServers: { [MCP_SERVER_NAME]: { url: MCP_SERVER_URL } } },
        null,
        2
    );

    /** Copy feedback keyed by what was copied: 'prompt' or a snippet id. */
    protected readonly copyStates = signal<Record<string, CopyState>>({});

    constructor() {
        this.destroyRef.onDestroy(() => this.resetTimers.forEach((timer) => clearTimeout(timer)));
    }

    protected stateOf(key: string): CopyState {
        return this.copyStates()[key] ?? 'idle';
    }

    protected async copyPrompt(): Promise<void> {
        const copied = await this.copy('prompt', this.prompt());
        if (copied) {
            this.promptCopied.emit();
        } else {
            // Leave the text selected so the user can copy it by hand.
            const field = this.promptField()?.nativeElement;
            field?.focus();
            field?.select();
        }
    }

    protected copySnippet(key: string, text: string): Promise<boolean> {
        return this.copy(key, text);
    }

    private async copy(key: string, text: string): Promise<boolean> {
        const copied = await copyText(text);
        this.copyStates.update((states) => ({ ...states, [key]: copied ? 'copied' : 'failed' }));
        clearTimeout(this.resetTimers.get(key));
        this.resetTimers.set(
            key,
            setTimeout(() => this.copyStates.update((states) => ({ ...states, [key]: 'idle' })), copied ? 2500 : 6000)
        );
        return copied;
    }
}
