import { ApplicationConfig } from '@angular/core';
import { PERSISTENCE } from '@angular/fire/compat/auth';

export const config: ApplicationConfig = {
    providers: [{ provide: PERSISTENCE, useValue: 'none' }],
};
