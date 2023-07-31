import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';

@Component({
    selector: 'proxy-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends BaseComponent implements OnInit {
    public toggleMenuSideBar: boolean;
    constructor() {
        super();
    }

    ngOnInit(): void {
        this.toggleMenuSideBar = this.getIsMobile();
    }

    public toggleSideBarEvent(event) {
        this.toggleMenuSideBar = !this.toggleMenuSideBar;
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return false;
        } else {
            return true;
        }
    }
}
