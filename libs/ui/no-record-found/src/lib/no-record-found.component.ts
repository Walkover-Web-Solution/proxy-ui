import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'proxy-no-record-found',
    imports: [MatCardModule, MatButtonModule],
    templateUrl: './no-record-found.component.html',
    styleUrls: ['./no-record-found.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoRecordFoundComponent {
    showBtn = input<boolean>(false);
    title = input<string>();
}
