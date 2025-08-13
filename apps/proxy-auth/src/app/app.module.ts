import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app.component';
import { ElementModule } from './element.module';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
let conditional_imports = [];
if (environment.production) {
    conditional_imports = [];
} else {
    conditional_imports.push(
        StoreDevtoolsModule.instrument({
            maxAge: 25,
            serialize: true,
        })
    );
}
@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, BrowserAnimationsModule, ElementModule, ...conditional_imports],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this.matIconRegistry.addSvgIcon(
            'visibility',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/visibility.svg')
        );

        this.matIconRegistry.addSvgIcon(
            'visibility_off',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/visibility_off.svg')
        );
    }
}
