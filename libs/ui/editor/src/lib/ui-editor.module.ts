import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { EditorComponent } from './editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { DirectivesAutoSelectDropdownModule } from '@proxy/directives/auto-select-dropdown';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MonacoEditorModule,
        MatSelectModule,
        DirectivesAutoSelectDropdownModule,
    ],
    declarations: [EditorComponent],
    exports: [EditorComponent],
})
export class UiEditorModule {}
