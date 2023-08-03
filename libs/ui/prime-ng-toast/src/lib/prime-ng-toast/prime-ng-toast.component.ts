import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { errorResolver } from '@proxy/models/root-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { isEqual } from 'lodash-es';
import { MessageService } from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { PrimeNgToastService } from '../prime-ng-toast.service';

@Component({
    selector: 'proxy-prime-ng-toast',
    templateUrl: './prime-ng-toast.component.html',
    styleUrls: ['./prime-ng-toast.component.scss'],
    providers: [MessageService],
})
export class PrimeNgToastComponent extends BaseComponent implements OnInit, OnDestroy {
    @Output() public undoMail = new EventEmitter<any>();
    private toastDefaultSetting = {
        summary: '',
        life: 3000,
    };
    public undoTimerInterval: any;
    public undoTimer: number = 0;

    constructor(
        private messageService: MessageService,
        private primengConfig: PrimeNGConfig,
        private primeNgToastService: PrimeNgToastService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.primengConfig.ripple = true;

        this.primeNgToastService.success$
            .pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.showSuccess(res.message, res.options);
                    this.primeNgToastService.success$.next(null);
                }
            });

        this.primeNgToastService.error$
            .pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.showError(res.message, res.options);
                    this.primeNgToastService.error$.next(null);
                }
            });

        this.primeNgToastService.warn$
            .pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.showWarn(res.message, res.options);
                    this.primeNgToastService.warn$.next(null);
                }
            });

        this.primeNgToastService.info$
            .pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.showInfo(res.message, res.options);
                    this.primeNgToastService.info$.next(null);
                }
            });

        this.primeNgToastService.action$
            .pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.showAction(res.message, res.options, res.buttonContent);
                    this.primeNgToastService.action$.next(null);
                }
            });

        this.primeNgToastService.clearActionToast$
            .pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) {
                    this.messageService.clear();
                    clearInterval(this.undoTimerInterval);
                    this.undoTimer = 0;
                    this.primeNgToastService.clearActionToast$.next(false);
                }
            });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public showSuccess(message, options): void {
        this.messageService.add({
            ...this.toastDefaultSetting,
            severity: 'success',
            detail: this.makeDetails(options, message),
            ...options,
        });
    }

    public showError(message, options): void {
        this.messageService.add({
            ...this.toastDefaultSetting,
            severity: 'error',
            detail: this.makeDetails(options, message),
            life: 5000,
            ...options,
        });
    }

    public showWarn(message, options): void {
        this.messageService.add({
            ...this.toastDefaultSetting,
            severity: 'warn',
            detail: this.makeDetails(options, message),
            ...options,
        });
    }

    public showInfo(message, options): void {
        this.messageService.add({
            ...this.toastDefaultSetting,
            severity: 'info',
            detail: this.makeDetails(options, message),
            ...options,
        });
    }

    public showAction(message, options, buttonContent): void {
        this.messageService.clear();
        clearInterval(this.undoTimerInterval);
        this.undoTimer = 0;
        this.messageService.add({
            ...this.toastDefaultSetting,
            severity: 'success',
            detail: {
                message: this.makeDetails(options, message),
                customAction: true,
                buttonContent,
            },
            ...options,
        });
        this.undoTimer = options?.life / 1000;
        this.undoTimerInterval = setInterval(() => {
            this.undoTimer -= 1;
        }, 1000);
    }

    public onReject(event): void {
        setTimeout(() => {
            if (event.message?.detail?.buttonContent === 'Undo' && this.undoTimer > 0) {
                this.undoMail.emit();
                clearInterval(this.undoTimerInterval);
            }
        }, 500);
    }

    private makeDetails(options, message): string | string[] {
        return options?.removeTextDecoration
            ? errorResolver(message)
            : errorResolver(message)[0]?.charAt(0)?.toUpperCase() + errorResolver(message)[0]?.slice(1)?.toLowerCase();
    }
}
