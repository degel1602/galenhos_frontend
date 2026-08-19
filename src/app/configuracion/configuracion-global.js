import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { rutasPrincipales } from '../rutas/rutas-principales';
export const configuracionGlobal = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(rutasPrincipales),
  ],
};
