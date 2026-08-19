import { bootstrapApplication } from '@angular/platform-browser';
import { configuracionGlobal } from './app/configuracion/configuracion-global';
import { ComponenteRaiz } from './app/raiz/componente-raiz';

bootstrapApplication(ComponenteRaiz, configuracionGlobal).catch((err) =>
  console.error(err),
);
