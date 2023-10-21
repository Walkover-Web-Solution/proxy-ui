import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement, NgElement, WithProperties } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OtpModule } from './otp/otp.module';
import { SendOtpComponent } from './otp/send-otp/send-otp.component';

declare global {
    interface Window {
        initVerification: any;
        intlTelInput: any;
    }
}

function documentReady(fn: any) {
    // see if DOM is already available
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

window['initVerification'] = (config: any) => {
    documentReady(() => {
        if (config?.referenceId) {
            const findOtpProvider = document.querySelector('proxy-auth');
            if (findOtpProvider) {
                document.body.removeChild(findOtpProvider);
            }
            const sendOtpElement = document.createElement('proxy-auth') as NgElement & WithProperties<SendOtpComponent>;
            sendOtpElement.referenceId = config.referenceId;
            sendOtpElement.addInfo = config?.addInfo ?? null;
            sendOtpElement.target = config?.target ?? '_self';
            sendOtpElement.css = config.style;
            if (!config.success || typeof config.success !== 'function') {
                throw Error('success callback function missing !');
            }
            sendOtpElement.successReturn = config.success;
            sendOtpElement.failureReturn = config.failure;
            document.getElementsByTagName('body')[0].append(sendOtpElement);
            window['libLoaded'] = true;
        } else {
            if (!config?.referenceId) {
                throw Error('Reference Id is missing!');
            } else {
                throw Error('Something went wrong!');
            }
        }
    });
};

@NgModule({
    imports: [BrowserModule, BrowserAnimationsModule, OtpModule],
    exports: [OtpModule],
})
export class ElementModule implements DoBootstrap {
    constructor(private injector: Injector) {
        if (!customElements.get('proxy-auth')) {
            const sendOtpComponent = createCustomElement(SendOtpComponent, {
                injector: this.injector,
            });
            customElements.define('proxy-auth', sendOtpComponent);
        }
    }

    ngDoBootstrap(appRef: ApplicationRef) {
        if (!customElements.get('proxy-auth')) {
            const sendOtpComponent = createCustomElement(SendOtpComponent, {
                injector: this.injector,
            });
            customElements.define('proxy-auth', sendOtpComponent);
        }
    }
}
