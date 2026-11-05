import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
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
    readonly selectedView = signal('Applications');
    readonly views = ['Applications', 'People', 'Activity'];
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
