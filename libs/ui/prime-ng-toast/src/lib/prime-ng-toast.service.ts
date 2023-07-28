import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PrimeNgToastService {
    public success$: Subject<any> = new Subject<any>();
    public error$: Subject<any> = new Subject<any>();
    public warn$: Subject<any> = new Subject<any>();
    public info$: Subject<any> = new Subject<any>();
    public action$: Subject<any> = new Subject<any>();
    public clearActionToast$: Subject<any> = new Subject<any>();

    public success(message: string, options: any = {}): void {
        this.success$.next({ message, options });
    }

    public error(message: string, options: any = {}): void {
        this.error$.next({ message, options });
    }

    public warn(message: string, options: any = {}): void {
        this.warn$.next({ message, options });
    }

    public info(message: string, options: any = {}): void {
        this.info$.next({ message, options });
    }

    public action(message: string, options: any = {}, buttonContent): void {
        this.action$.next({ message, options, buttonContent });
    }

    public clearActionToast(): void {
        this.clearActionToast$.next(true);
    }
}
