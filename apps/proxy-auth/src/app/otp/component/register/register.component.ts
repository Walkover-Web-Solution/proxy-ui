import { environment } from './../../../../environments/environment';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { resetAll } from '../../store/actions/otp.action';
import { BaseComponent } from '@proxy/ui/base-component';
import { Store } from '@ngrx/store';
import { IAppState } from '../../store/app.state';
import { META_TAG_ID } from '@proxy/constant';
import { IntlPhoneLib } from '@proxy/utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';

@Component({
    selector: 'proxy-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends BaseComponent implements OnInit, OnDestroy {
    @Output() public togglePopUp: EventEmitter<any> = new EventEmitter();
    @Output() public successReturn: EventEmitter<any> = new EventEmitter();
    @Output() public failureReturn: EventEmitter<any> = new EventEmitter();

    public registrationForm = new FormGroup({
        user: new FormGroup({
            firstName: new FormControl<string>(null, [Validators.required]),
            lastName: new FormControl<string>(null, []),
            email: new FormControl<string>(null, [Validators.required]),
            mobile: new FormControl<string>(null, [Validators.required]),
            password: new FormControl<string>(null, [Validators.required]),
            confirmPassword: new FormControl<string>(null, [Validators.required]),
        }),
        company: new FormGroup({
            name: new FormControl<string>(null),
            mobile: new FormControl<string>(null),
            email: new FormControl<string>(null),
        }),
    });

    constructor(private store: Store<IAppState>) {
        super();
    }

    ngOnInit(): void {}

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public initIntl(): void {
        const parentDom = document.querySelector('proxy-auth')?.shadowRoot;
        const input = document.querySelector('proxy-auth')?.shadowRoot?.getElementById('init-contact');
        const customCssStyleURL = `${environment.baseUrl}/${
            environment.production ? 'app' : 'hello-new'
        }/assets/utils/intl-tel-input-custom.css`;

        if (input) {
            new IntlPhoneLib(input, parentDom, customCssStyleURL);
        }
    }

    public close(closeByUser: boolean = false): void {
        document.getElementById(META_TAG_ID)?.remove();
        this.resetStore();
        this.togglePopUp.emit();
        if (closeByUser) {
            this.failureReturn.emit({
                code: 0, // code use for close by user
                closeByUser, // boolean value for status
                message: 'User cancelled the registration process.',
            });
        }
    }

    public resetStore(): void {
        this.store.dispatch(resetAll());
    }

    public submit(): void {
        console.log('Submit', this.registrationForm.value);
    }
}
