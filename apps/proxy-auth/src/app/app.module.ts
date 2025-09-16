import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app.component';
import { ElementModule } from './element.module';
import { NgHcaptchaModule } from 'ng-hcaptcha';

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
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ElementModule,
        NgHcaptchaModule.forRoot({
            siteKey: environment.hCaptchaSiteKey,
        }),
        ...conditional_imports,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
