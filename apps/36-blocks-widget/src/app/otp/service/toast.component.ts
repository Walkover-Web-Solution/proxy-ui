import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { ToastService } from './toast.service';
import { WidgetThemeService } from './widget-theme.service';

@Component({
    selector: 'proxy-toast',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (toastService.toast()) {
        <div
            aria-live="assertive"
            class="pointer-events-none fixed inset-0 flex items-start justify-end px-4 py-6 sm:p-6 z-[9999]"
        >
            <div
                class="pointer-events-auto w-full max-w-sm rounded-lg shadow-lg ring-1"
                [class.bg-gray-800]="isDark()"
                [class.ring-gray-700]="isDark()"
                [class.bg-white]="!isDark()"
                [class.ring-gray-200]="!isDark()"
            >
                <div class="p-4">
                    <div class="flex items-start">
                        <div class="shrink-0">
                            @if (toastService.toast()!.type === 'success') {
                            <svg
                                class="size-6 text-green-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                aria-hidden="true"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                            </svg>
                            } @else if (toastService.toast()!.type === 'info') {
                            <svg
                                class="size-6 text-blue-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                aria-hidden="true"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                />
                            </svg>
                            } @else {
                            <svg
                                class="size-6 text-red-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                aria-hidden="true"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                />
                            </svg>
                            }
                        </div>
                        <div class="ml-3 w-0 flex-1 pt-0.5">
                            <p
                                class="text-sm font-medium"
                                [class.text-gray-900]="!isDark()"
                                [class.text-white]="isDark()"
                            >
                                {{
                                    toastService.toast()!.type === 'success'
                                        ? 'Success'
                                        : toastService.toast()!.type === 'info'
                                        ? 'Info'
                                        : 'Error'
                                }}
                            </p>
                            <p class="mt-1 text-sm" [class.text-gray-500]="!isDark()" [class.text-gray-400]="isDark()">
                                {{ toastService.toast()!.message }}
                            </p>
                        </div>
                        <div class="ml-4 flex shrink-0">
                            <button
                                type="button"
                                (click)="toastService.dismiss()"
                                class="inline-flex rounded-md cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                                [class.text-gray-500]="isDark()"
                                [class.hover:text-white]="isDark()"
                                [class.text-gray-400]="!isDark()"
                                [class.hover:text-gray-600]="!isDark()"
                                aria-label="Close notification"
                            >
                                <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path
                                        d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        }
    `,
})
export class ToastComponent {
    readonly theme = input<string>();
    readonly toastService = inject(ToastService);
    private readonly themeService = inject(WidgetThemeService);
    readonly isDark = this.themeService.isDark;

    constructor() {
        effect(() => this.themeService.setInputTheme(this.theme()));
    }
}
