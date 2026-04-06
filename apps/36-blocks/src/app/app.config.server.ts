import { ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

export const config: ApplicationConfig = {
    providers: [provideServerRendering(withRoutes(serverRoutes))],
};
