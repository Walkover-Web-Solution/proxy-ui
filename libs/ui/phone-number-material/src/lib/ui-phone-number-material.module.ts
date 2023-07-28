import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { ClickOutsideModule } from 'ng-click-outside';
import { PhoneNumberControl } from './phone-number-material';

@NgModule({
    declarations: [PhoneNumberControl],
    imports: [FormsModule, ReactiveFormsModule, CommonModule, MatRippleModule, MatDividerModule, ClickOutsideModule],
    providers: [PhoneNumberControl],
    exports: [PhoneNumberControl],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UiPhoneNumberMaterialModule {}
