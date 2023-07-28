import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InboxAutocompleteComponent } from './inbox-autocomplete/inbox-autocomplete.component';
import { MatButtonModule } from '@angular/material/button';
import { ServicesMsg91ComposeModule } from '@msg91/services/msg91/compose';
import { DirectivesAutoSelectDropdownModule } from '@msg91/directives/auto-select-dropdown';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        ServicesMsg91ComposeModule,
        DirectivesAutoSelectDropdownModule,
    ],
    declarations: [InboxAutocompleteComponent],
    exports: [InboxAutocompleteComponent],
})
export class UiComponentsInboxAutocompleteModule {}
