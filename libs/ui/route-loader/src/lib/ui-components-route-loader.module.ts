import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLoaderComponent } from './router-loader.component';
import { PipesReplaceModule } from '@proxy/pipes/replace';

@NgModule({
    declarations: [RouterLoaderComponent],
    imports: [CommonModule, PipesReplaceModule],
    exports: [RouterLoaderComponent],
})
export class UiComponentsRouteLoaderModule {}
