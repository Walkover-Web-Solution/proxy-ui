import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { WIDGET_EXAMPLE } from './widget-example';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-docs',
    imports: [RouterModule],
    templateUrl: './docs.component.html',
})
export class DocsComponent implements OnInit {
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    public readonly example = WIDGET_EXAMPLE;

    public ngOnInit(): void {
        this.title.setTitle('Integration guide — 36Blocks');
        this.meta.updateTag({
            name: 'description',
            content:
                'Mount the 36Blocks authentication widget and understand application, session, and permission boundaries.',
        });
        this.meta.updateTag({ property: 'og:title', content: 'Integration guide — 36Blocks' });
        this.meta.updateTag({
            property: 'og:description',
            content: 'Widget configuration and application security boundaries.',
        });
    }
}
