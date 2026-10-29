import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ScrollRevealDirective } from '../directives/scroll-reveal.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-security',
    imports: [ScrollRevealDirective],
    templateUrl: './security.component.html',
})
export class SecurityComponent implements OnInit {
    private readonly titleService = inject(Title);
    private readonly metaService = inject(Meta);

    public ngOnInit(): void {
        this.titleService.setTitle('Security — 36Blocks');
        this.metaService.updateTag({
            name: 'description',
            content:
                'Understand authentication configuration, application access boundaries, and investigation coverage in 36Blocks.',
        });
        this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
        this.metaService.updateTag({ property: 'og:title', content: 'Security — 36Blocks' });
        this.metaService.updateTag({
            property: 'og:description',
            content: 'Authentication configuration and application security boundaries.',
        });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }
}
