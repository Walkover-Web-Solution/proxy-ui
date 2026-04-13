import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ScrollRevealDirective } from '../directives/scroll-reveal.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-privacy',
    imports: [ScrollRevealDirective],
    templateUrl: './privacy.component.html',
})
export class PrivacyComponent implements OnInit {
    private readonly titleService = inject(Title);
    private readonly metaService = inject(Meta);

    public ngOnInit(): void {
        this.titleService.setTitle('Privacy Policy — 36Blocks');
        this.metaService.updateTag({
            name: 'description',
            content:
                'Read the 36Blocks Privacy Policy. Learn what data we collect, how we use it, and your rights as a user or developer on our platform.',
        });
        this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
        this.metaService.updateTag({ property: 'og:title', content: 'Privacy Policy — 36Blocks' });
        this.metaService.updateTag({
            property: 'og:description',
            content: 'How 36Blocks collects, uses, and protects your data.',
        });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }
}
