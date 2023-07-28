import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { takeUntil } from 'rxjs/operators';
import { CmdEnterPreferenceService } from './cmd-enter-preference.service';

@Component({
    selector: 'msg91-cmd-enter-preference',
    templateUrl: './cmd-enter-preference.component.html',
    styleUrls: ['./cmd-enter-preference.component.scss'],
})
export class CmdEnterPreferenceComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() type: string;
    public isCmdEnter: boolean;
    public buttonName: string;

    constructor(private cmdEnterPreferenceService: CmdEnterPreferenceService) {
        super();
    }

    ngOnInit(): void {
        this.cmdEnterPreferenceService.isCmdEnter$
            .pipe(takeUntil(this.destroy$))
            .subscribe((value) => (this.isCmdEnter = value));
        this.buttonName = navigator.userAgent.indexOf('Mac') !== -1 ? 'Cmd' : 'Ctrl';
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public toggleCmdEnter() {
        this.cmdEnterPreferenceService.setPreference(!this.isCmdEnter);
    }
}
