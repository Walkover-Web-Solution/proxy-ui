import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AbstractControl } from '@angular/forms';

export interface ServiceListItem {
    name: string;
    icon?: string;
}

@Component({
    selector: 'proxy-service-list',
    imports: [MatListModule, MatIconModule],
    templateUrl: './service-list.component.html',
    styleUrls: ['./service-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceListComponent {
    services = input.required<ServiceListItem[]>();
    selectedIndex = input<number>(0);
    getFormAt = input<(index: number) => AbstractControl | null>();
    serviceSelect = output<number>();

    isInvalid(i: number): boolean {
        const getter = this.getFormAt();
        if (!getter) return false;
        const control = getter(i);
        return !!(control && i !== this.selectedIndex() && control.dirty && control.touched && control.invalid);
    }
}
