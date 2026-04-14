import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ScrollRevealDirective } from '../directives/scroll-reveal.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-terms',
    imports: [ScrollRevealDirective],
    templateUrl: './terms.component.html',
})
export class TermsComponent implements OnInit {
    private readonly titleService = inject(Title);
    private readonly metaService = inject(Meta);

    public ngOnInit(): void {
        this.titleService.setTitle('Terms of Service — 36Blocks');
        this.metaService.updateTag({
            name: 'description',
            content:
                'Read the 36Blocks Terms of Service covering acceptable use, billing, intellectual property, and limitations of liability.',
        });
        this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
        this.metaService.updateTag({ property: 'og:title', content: 'Terms of Service — 36Blocks' });
        this.metaService.updateTag({
            property: 'og:description',
            content: 'The terms governing your use of the 36Blocks platform.',
        });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }
}
