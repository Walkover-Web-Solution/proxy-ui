import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';

export const browserConfig: ApplicationConfig = {
    providers: [
        importProvidersFrom(AngularFireModule.initializeApp(environment.firebaseConfig), AngularFireAuthModule),
    ],
};
