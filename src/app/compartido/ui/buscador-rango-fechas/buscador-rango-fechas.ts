import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface CriteriosBusqueda {
  filtro: string;
  fechaDesde: string;
  fechaHasta: string;
}

@Component({
  selector: 'buscador-rango-fechas',
  standalone: true,
  imports: [FormsModule, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './buscador-rango-fechas.html',
})
export class BuscadorRangoFechas {
  @Input() placeholder: string = 'Buscar…';
  @Input() textoBoton: string = 'Buscar';
  @Input() cargando: boolean = false;

  @Input() set fechaDesdeInicial(v: string) {
    this.fechaDesde = v ?? '';
  }
  @Input() set fechaHastaInicial(v: string) {
    this.fechaHasta = v ?? '';
  }
  @Input() set filtroInicial(v: string) {
    this.filtro = v ?? '';
  }

  @Output() buscar = new EventEmitter<CriteriosBusqueda>();
  @Output() limpiarFiltros = new EventEmitter<void>();

  filtro = '';
  fechaDesde = '';
  fechaHasta = '';

  emitirBusqueda() {
    if (
      this.fechaDesde &&
      this.fechaHasta &&
      this.fechaDesde > this.fechaHasta
    ) {
      [this.fechaDesde, this.fechaHasta] = [this.fechaHasta, this.fechaDesde];
    }
    this.buscar.emit({
      filtro: this.filtro.trim(),
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
    });
  }

  limpiar() {
    this.filtro = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.limpiarFiltros.emit();
  }
}
