import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { MainLeftSideNavComponent } from './main-left-side-nav/main-left-side-nav.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    ],
})
export class LayoutModule {}
