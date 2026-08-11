import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { rutasPrincipales } from '../rutas/rutas-principales';

export const configuracionGlobal: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(rutasPrincipales)
  ]
};
