import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
@Component({
    selector: 'proxy-about',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    templateUrl: './about.component.html',
})
export class AboutComponent implements OnInit {
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    ngOnInit(): void {
        this.title.setTitle('Our approach — 36blocks');
        this.meta.updateTag({
            name: 'description',
            content: 'Clarity for application authentication, people and investigation. Built for our internal teams.',
        });
        this.meta.updateTag({ property: 'og:title', content: 'Our approach — 36blocks' });
    }
}
