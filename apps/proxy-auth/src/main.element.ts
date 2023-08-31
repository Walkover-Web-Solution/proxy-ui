import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ElementModule } from './app/element.module';
import { environment } from './environments/environment';
import 'zone.js';
import 'zone.js/dist/webapis-shadydom.js'; // For webcomponents compatibility
import '@webcomponents/custom-elements/src/native-shim';
import '@webcomponents/custom-elements/custom-elements.min';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(ElementModule)
    .catch((err) => console.log(err));
