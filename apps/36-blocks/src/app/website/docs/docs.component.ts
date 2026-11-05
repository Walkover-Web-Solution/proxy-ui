import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-docs',
    imports: [RouterModule],
    templateUrl: './docs.component.html',
})
export class DocsComponent implements OnInit {
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);

    public ngOnInit(): void {
        this.title.setTitle('Developer documentation — 36blocks');
        this.meta.updateTag({
            name: 'description',
            content: 'Open the canonical 36blocks developer documentation for setup, integration and API guidance.',
        });
        this.meta.updateTag({ property: 'og:title', content: 'Developer documentation — 36blocks' });
        this.meta.updateTag({
            property: 'og:description',
            content: 'Widget configuration and application security boundaries.',
        });
    }
}
