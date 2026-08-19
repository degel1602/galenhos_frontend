import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BienvenidaService {
  readonly mostrarOverlay = signal<boolean>(false);

  activar(): void {
    this.mostrarOverlay.set(true);
  }

  desactivar(): void {
    this.mostrarOverlay.set(false);
  }
}
