import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './input/input.component';
import { TextareaComponent } from './textarea/textarea.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextInputHighlightModule } from 'angular-text-input-highlight';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UiAngularMentionsModule } from '@proxy/ui/angular-mentions';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TextInputHighlightModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        UiAngularMentionsModule,
    ],
    declarations: [InputComponent, TextareaComponent],
    exports: [InputComponent, TextareaComponent],
})
export class UiVariableInputModule {}
