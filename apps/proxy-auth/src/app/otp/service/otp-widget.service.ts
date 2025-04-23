import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
const WIDGET_SCRIPT_JS = `https://control.msg91.com/app/assets/otp-provider/otp-provider.js`;

declare var window;

@Injectable()
export class OtpWidgetService {
    private widgetId: string;
    private tokenAuth: string;
    private userState: string;
    private scriptAdded = false;
    public showlogin = new BehaviorSubject<boolean>(false);

    public scriptLoading = new BehaviorSubject<boolean>(false);
    public otpWidgetToken = new BehaviorSubject<string>(null);

    public otpWidgetError = new Subject<{ code: number; message: string; closeByUser?: boolean }>();

    private readonly loadWidgetFunc = () => {
        this.scriptLoading.next(false);
        const configuration = {
            widgetId: this.widgetId,
            tokenAuth: this.tokenAuth,
            state: this.userState,
            success: (data) => {
                // get verified token in response
                this.otpWidgetToken.next(data.message);
            },
            failure: (error) => {
                // handle error
                this.otpWidgetError.next(error);
            },
        };
        window.initSendOTP(configuration);
    };

    public setWidgetConfig(widgetId: string, tokenAuth: string, state: string) {
        this.widgetId = widgetId;
        this.tokenAuth = tokenAuth;
        this.userState = state;
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
    public openLogin(value: boolean) {
        this.showlogin.next(value);
    }
}
