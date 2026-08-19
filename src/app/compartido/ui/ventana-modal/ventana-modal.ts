import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ventana-modal',
  standalone: true,
  templateUrl: './ventana-modal.html',
})
export class VentanaModal {
  @Input() titulo: string = '';
  @Input() subtitulo?: string;
  @Input() ancho: number = 640;
  @Output() alCerrar = new EventEmitter<void>();

  cerrar() {
    this.alCerrar.emit();
  }
}
