import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CmdEnterPreferenceService {
    constructor() {}

    private isCmdEnterSource: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        localStorage.getItem('isCmdEnter') ? JSON.parse(localStorage.getItem('isCmdEnter')) : true
    );
    public isCmdEnter$: Observable<any> = this.isCmdEnterSource.asObservable();

    public setPreference(value) {
        this.isCmdEnterSource.next(value);
        localStorage.setItem('isCmdEnter', JSON.stringify(value));
    }
}
