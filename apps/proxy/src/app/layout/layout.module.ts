import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { MainLeftSideNavComponent } from './main-left-side-nav/main-left-side-nav.component';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { UiVirtualScrollModule } from '@proxy/ui/virtual-scroll';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
    declarations: [LayoutComponent, MainLeftSideNavComponent],
    imports: [
        CommonModule,
        LayoutRoutingModule,
        MatMenuModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatSidenavModule,
        MatToolbarModule,
        MatExpansionModule,
        MatTooltipModule,
        UiVirtualScrollModule,
        ScrollingModule,
    ],
})
export class LayoutModule {}
