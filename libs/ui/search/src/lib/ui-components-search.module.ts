import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { DirectivesRemoveCharacterDirectiveModule } from '@proxy/directives/RemoveCharacterDirective';

@NgModule({
    declarations: [SearchComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatInputModule,
        DirectivesRemoveCharacterDirectiveModule,
    ],
    exports: [SearchComponent],
})
export class UiComponentsSearchModule {}
