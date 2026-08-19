import { Component, EventEmitter, Input, Output } from '@angular/core';
import { __decorate } from 'tslib';

let VentanaModal = class VentanaModal {
  titulo = '';
  subtitulo;
  ancho = 640;
  alCerrar = new EventEmitter();
  cerrar() {
    this.alCerrar.emit();
  }
};
__decorate([Input()], VentanaModal.prototype, 'titulo', void 0);
__decorate([Input()], VentanaModal.prototype, 'subtitulo', void 0);
__decorate([Input()], VentanaModal.prototype, 'ancho', void 0);
__decorate([Output()], VentanaModal.prototype, 'alCerrar', void 0);
VentanaModal = __decorate(
  [
    Component({
      selector: 'ventana-modal',
      standalone: true,
      templateUrl: './ventana-modal.html',
    }),
  ],
  VentanaModal,
);

export { VentanaModal };
