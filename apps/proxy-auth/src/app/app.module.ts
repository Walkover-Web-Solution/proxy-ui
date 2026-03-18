import { ApplicationRef, DoBootstrap, NgModule, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app.component';
import { ElementModule } from './element.module';

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
    declarations: [],
    imports: [AppComponent, BrowserModule, BrowserAnimationsModule, ElementModule, ...conditional_imports],
    providers: [provideZoneChangeDetection({ eventCoalescing: true })],
})
export class AppModule implements DoBootstrap {
    ngDoBootstrap(appRef: ApplicationRef) {
        if (document.querySelector('proxy-root')) {
            appRef.bootstrap(AppComponent);
        }
    }
}
