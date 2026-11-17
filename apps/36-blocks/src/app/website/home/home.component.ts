import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { buildGeneralIntegrationPrompt } from '../../ai-setup/ai-prompts';
import { copyText } from '../../ai-setup/clipboard';

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
    readonly integrationPrompt = buildGeneralIntegrationPrompt();
    readonly copyState = signal<CopyState>('idle');
    readonly hintDismissed = signal(false);

    constructor() {
        this.destroyRef.onDestroy(() => clearTimeout(this.copyResetTimer));
    }

    async copyPrompt(): Promise<void> {
        this.hintDismissed.set(true);
        const copied = await copyText(this.integrationPrompt);
        this.copyState.set(copied ? 'copied' : 'failed');
        clearTimeout(this.copyResetTimer);
        this.copyResetTimer = setTimeout(() => this.copyState.set('idle'), copied ? 2500 : 5000);
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
