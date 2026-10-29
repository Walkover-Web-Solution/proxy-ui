import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IAppState, selectProjectInProcess } from '../../core/ngrx';

@Component({
    selector: 'proxy-project-load-error',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe],
    template: `
        <main class="max-w-xl mx-auto p-8">
            <h1 class="text-2xl font-semibold mb-4">Projects could not be loaded</h1>
            <p role="alert" class="mb-4">
                The project request failed. Check your connection and try again. Your projects have not been changed.
            </p>
            <button type="button" class="px-4 py-2 border rounded" [disabled]="loading$ | async" (click)="retry()">
                {{ (loading$ | async) ? 'Loading projects…' : 'Retry loading projects' }}
            </button>
        </main>
    `,
})
export class ProjectLoadErrorComponent {
    private readonly store = inject<Store<IAppState>>(Store);
    private readonly router = inject(Router);
    public readonly loading$ = this.store.select(selectProjectInProcess);

    public retry(): void {
        void this.router.navigate(['/app']);
    }
}
