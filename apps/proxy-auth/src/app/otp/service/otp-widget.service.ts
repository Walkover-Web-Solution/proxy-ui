import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const WIDGET_SCRIPT_JS = `https://control.msg91.com/app/assets/otp-provider/otp-provider.js`;

declare var window;

@Injectable()
export class OtpWidgetService {
    private widgetId: string;
    private tokenAuth: string;
    private scriptAdded = false;

    public scriptLoading = new BehaviorSubject<boolean>(false);
    public otpWidgetToken = new BehaviorSubject<string>(null);

    private readonly loadWidgetFunc = () => {
        this.scriptLoading.next(false);
        const configuration = {
            widgetId: this.widgetId,
            tokenAuth: this.tokenAuth,
            success: (data) => {
                // get verified token in response
                this.otpWidgetToken.next(data.message);
            },
            failure: (error) => {
                // handle error
                console.log(error.message);
            },
        };
        window.initSendOTP(configuration);
    };

    public setWidgetConfig(widgetId: string, tokenAuth: string) {
        this.widgetId = widgetId;
        this.tokenAuth = tokenAuth;
    }

    public loadScript(onLoadFunc: () => void = () => this.scriptLoading.next(false)): void {
        this.scriptLoading.next(true);
        const head = document.getElementsByTagName('head')[0];
        const currentTimestamp = new Date().getTime();
        const otpProviderScript = document.createElement('script');
        otpProviderScript.type = 'text/javascript';
        otpProviderScript.src = `${WIDGET_SCRIPT_JS}?v=${currentTimestamp}`;
        head.appendChild(otpProviderScript);
        otpProviderScript.onload = onLoadFunc;
        this.scriptAdded = true;
    }

    public openWidget() {
        if (this.scriptAdded) {
            this.loadWidgetFunc();
        } else {
            this.loadScript(this.loadWidgetFunc);
        }
    }
}
