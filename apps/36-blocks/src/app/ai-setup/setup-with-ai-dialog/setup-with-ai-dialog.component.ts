import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SetupDialogData } from '../ai-setup.service';
import { AiSetupPanelComponent } from '../ai-setup-panel/ai-setup-panel.component';

/**
 * "Set up with AI": the prompt for the current context plus how to connect the 36Blocks MCP server. The prompt holds
 * no credential: the user's tool signs in through the browser authorization page.
 */
@Component({
    selector: 'proxy-setup-with-ai-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, MatDialogModule, AiSetupPanelComponent],
    templateUrl: './setup-with-ai-dialog.component.html',
})
export class SetupWithAiDialogComponent {
    protected readonly data = inject<SetupDialogData>(MAT_DIALOG_DATA);
}
