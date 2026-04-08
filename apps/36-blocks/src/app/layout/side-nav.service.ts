import { Injectable, inject, signal } from '@angular/core';
import { UiSettingsService } from './ui-settings.service';

@Injectable({ providedIn: 'root' })
export class SideNavService {
    private uiSettings = inject(UiSettingsService);

    public isSideNavOpen = signal<boolean>(this.uiSettings.sideNavOpen);

    public toggle(): void {
        const next = !this.isSideNavOpen();
        this.isSideNavOpen.set(next);
        this.uiSettings.setSideNavOpen(next);
    }

    public open(): void {
        this.isSideNavOpen.set(true);
        this.uiSettings.setSideNavOpen(true);
    }

    public close(): void {
        this.isSideNavOpen.set(false);
        this.uiSettings.setSideNavOpen(false);
    }
}
