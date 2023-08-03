import { Component, inject, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { ONLY_INTEGER_REGEX } from '@proxy/regex';
import { take } from 'rxjs';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    template: '',
})
export abstract class BaseComponent implements OnDestroy {
    private _destroy$: Subject<any>;
    protected _hasUnsavedData: boolean;
    public location: Location = inject(Location);
    private injectedRouter = inject(Router);

    constructor() {
        this._hasUnsavedData = false;
    }

    get destroy$() {
        if (!this._destroy$) {
            this._destroy$ = new Subject();
        }
        return this._destroy$;
    }

    public ngOnDestroy(): void {
        this._hasUnsavedData = false;
        if (this._destroy$) {
            this._destroy$.next(true);
            this._destroy$.complete();
        }
    }

    public makeFormDirty(form: UntypedFormGroup | UntypedFormArray): void {
        if (form instanceof UntypedFormGroup) {
            // tslint:disable-next-line:forin
            for (const controlsKey in form.controls) {
                const control = form.get(controlsKey);
                if (control instanceof UntypedFormArray || control instanceof UntypedFormGroup) {
                    this.makeFormDirty(control);
                }
                control.markAsTouched();
            }
        } else {
            form.controls.forEach((c) => {
                if (c instanceof UntypedFormArray || c instanceof UntypedFormGroup) {
                    this.makeFormDirty(c);
                }
                c.markAsTouched();
            });
        }
    }

    public onlyNumber(e: KeyboardEvent): void {
        const inputChar = String.fromCharCode(e.charCode);
        if (e.keyCode !== 8 && !new RegExp(ONLY_INTEGER_REGEX).test(inputChar)) {
            e.preventDefault();
        }
    }

    public hasUnsavedData(): boolean {
        return this._hasUnsavedData;
    }

    public getValueFromObservable(observable: Observable<any>): any {
        let returnValue: any;
        observable.pipe(take(1)).subscribe((value) => (returnValue = value));
        return returnValue;
    }

    /**
     * Navigates back in the platform's history.
     */
    goBackToHistory(redirectTo: string[] = null): void {
        if (redirectTo?.length) {
            this.injectedRouter.navigate(redirectTo);
        } else {
            this.location.back();
        }
    }
}
