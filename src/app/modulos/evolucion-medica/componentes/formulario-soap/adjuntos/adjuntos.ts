import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-adjuntos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adjuntos.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdjuntosComponent {
  // Para la maqueta esto solo mostrará la interfaz de carga de archivos
}
