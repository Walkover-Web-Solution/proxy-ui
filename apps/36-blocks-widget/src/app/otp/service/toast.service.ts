import { Injectable, signal } from '@angular/core';

export interface ToastConfig {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    readonly toast = signal<ToastConfig | null>(null);
    private timer: ReturnType<typeof setTimeout> | null = null;

    show(config: ToastConfig): void {
        if (this.timer) clearTimeout(this.timer);
        this.toast.set(config);
        this.timer = setTimeout(() => this.dismiss(), config.duration ?? 3000);
    }

    success(message: string, duration = 3000): void {
        this.show({ message, type: 'success', duration });
    }

    error(message: string, duration = 3000): void {
        this.show({ message, type: 'error', duration });
    }

    info(message: string, duration = 3000): void {
        this.show({ message, type: 'info', duration });
    }

    dismiss(): void {
        if (this.timer) clearTimeout(this.timer);
        this.toast.set(null);
    }
}
