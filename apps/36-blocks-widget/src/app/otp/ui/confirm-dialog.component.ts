import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Reusable destructive confirm dialog.
 * Usage:
 * <proxy-confirm-dialog
 *   [title]="'Leave company'"
 *   [message]="'Are you sure you want to leave this company?'"
 *   [confirmLabel]="'Leave'"
 *   [isDark]="isDark()"
 *   (confirmed)="onConfirm()"
 *   (cancelled)="onCancel()"
 * />
 */
@Component({
    selector: 'proxy-confirm-dialog',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div
            class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            style="z-index:2147483646"
            (click)="cancelled.emit()"
            aria-hidden="true"
        ></div>
        <div
            role="alertdialog"
            [attr.aria-labelledby]="'confirm-title-' + _id"
            [attr.aria-describedby]="'confirm-desc-' + _id"
            aria-modal="true"
            [class.dark]="isDark()"
            style="z-index:2147483647"
            class="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 rounded-xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 p-6"
        >
            <div class="flex items-start gap-4">
                <div
                    class="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
                    aria-hidden="true"
                >
                    <svg
                        class="size-5 text-red-600 dark:text-red-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                        />
                    </svg>
                </div>
                <div class="min-w-0 flex-1">
                    <h3 [id]="'confirm-title-' + _id" class="text-base font-semibold text-gray-900 dark:text-white">
                        {{ title() }}
                    </h3>
                    <p [id]="'confirm-desc-' + _id" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {{ message() }}
                    </p>
                </div>
            </div>
            <div class="mt-5 flex justify-end gap-3">
                <button
                    type="button"
                    (click)="cancelled.emit()"
                    class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                    {{ cancelLabel() }}
                </button>
                <button
                    type="button"
                    (click)="confirmed.emit()"
                    class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm cursor-pointer hover:bg-red-500 active:bg-red-700 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                >
                    {{ confirmLabel() }}
                </button>
            </div>
        </div>
    `,
})
export class ConfirmDialogComponent {
    readonly title = input<string>('Confirm Action');
    readonly message = input<string>('Are you sure?');
    readonly confirmLabel = input<string>('Confirm');
    readonly cancelLabel = input<string>('Cancel');
    readonly isDark = input<boolean>(false);

    readonly confirmed = output<void>();
    readonly cancelled = output<void>();

    readonly _id = Math.random().toString(36).slice(2, 8);
}
