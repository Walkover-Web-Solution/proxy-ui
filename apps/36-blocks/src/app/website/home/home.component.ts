import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

const INTEGRATION_PROMPT = `Integrate 36Blocks User APIs into our project based on our requirement and use cases.
First, read the official API documentation at https://developers.36blocks.com/llms.txt.
Ask what I want to build if I haven't explained it yet.

To run the APIs, prefer the MCP server: https://mcp.docstar.io/connector/36blocks_user_api

If you can't connect MCP, use the CLI instead (run once to install the modules): npx docstar-cli init 36blocks_user_api
Then: npx docstar-cli 36blocks_user_api <module> <endpoint> [--flags]  (npx docstar-cli list 36blocks_user_api shows what's available)`;

type CopyState = 'idle' | 'copied' | 'failed';

@Component({
    selector: 'proxy-home',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    private readonly destroyRef = inject(DestroyRef);
    private copyResetTimer?: ReturnType<typeof setTimeout>;
    readonly selectedView = signal('Applications');
    readonly views = ['Applications', 'People', 'Activity'];
    readonly integrationPrompt = INTEGRATION_PROMPT;
    readonly copyState = signal<CopyState>('idle');
    readonly hintDismissed = signal(false);

    constructor() {
        this.destroyRef.onDestroy(() => clearTimeout(this.copyResetTimer));
    }

    async copyPrompt(): Promise<void> {
        this.hintDismissed.set(true);
        let copied = false;
        try {
            await navigator.clipboard.writeText(this.integrationPrompt);
            copied = true;
        } catch {
            copied = this.copyWithSelectionFallback();
        }
        this.copyState.set(copied ? 'copied' : 'failed');
        clearTimeout(this.copyResetTimer);
        this.copyResetTimer = setTimeout(() => this.copyState.set('idle'), copied ? 2500 : 5000);
    }

    // Used when the async Clipboard API is unavailable (insecure context, older browsers, denied permission).
    private copyWithSelectionFallback(): boolean {
        if (typeof document === 'undefined') {
            return false;
        }
        const field = document.createElement('textarea');
        field.value = this.integrationPrompt;
        field.setAttribute('readonly', '');
        field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
        document.body.appendChild(field);
        field.select();
        try {
            return document.execCommand('copy');
        } catch {
            return false;
        } finally {
            field.remove();
        }
    }

    ngOnInit(): void {
        this.title.setTitle('36blocks — A clearer view of access');
        this.meta.updateTag({
            name: 'description',
            content:
                'An internal workspace for application authentication, people, request logs and operator activity.',
        });
        this.meta.updateTag({ property: 'og:title', content: '36blocks — A clearer view of access' });
        this.meta.updateTag({
            property: 'og:description',
            content: 'Application authentication, people and investigation in one internal workspace.',
        });
    }
}
