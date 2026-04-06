import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
    selector: 'blocks-feature-preview',
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './feature-preview.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturePreviewComponent {
    @Input() referenceId: string | null = null;

    private router = inject(Router);

    public openPreview(): void {
        if (this.referenceId) {
            this.router.navigate(['/widget-preview', this.referenceId]);
        }
    }
}
