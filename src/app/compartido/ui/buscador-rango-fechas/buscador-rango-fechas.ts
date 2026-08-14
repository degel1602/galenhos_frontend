import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

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
  template: `
    <div class="flex flex-wrap items-center gap-2 w-full">
      <!-- Texto de búsqueda -->
      <div class="relative flex-1 min-w-[200px]">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a0bd]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          [(ngModel)]="filtro"
          (keyup.enter)="emitirBusqueda()"
          class="w-full border border-[#dde3ef] rounded-lg py-2 pl-9 pr-3 text-sm text-[#07153a] bg-white focus:outline-none focus:ring-2 focus:ring-[#263c7a]/25 focus:border-[#263c7a] transition-all placeholder:text-[#94a0bd]"
          [placeholder]="placeholder"
        >
      </div>

      <!-- Desde -->
      <input
        type="date"
        [(ngModel)]="fechaDesde"
        title="Desde"
        class="border border-[#dde3ef] rounded-lg py-[7px] px-3 text-sm text-[#07153a] bg-white focus:outline-none focus:ring-2 focus:ring-[#263c7a]/25 focus:border-[#263c7a] transition-all"
      >

      <!-- Hasta -->
      <input
        type="date"
        [(ngModel)]="fechaHasta"
        title="Hasta"
        class="border border-[#dde3ef] rounded-lg py-[7px] px-3 text-sm text-[#07153a] bg-white focus:outline-none focus:ring-2 focus:ring-[#263c7a]/25 focus:border-[#263c7a] transition-all"
      >

      <button
        (click)="emitirBusqueda()"
        class="bg-[#263c7a] hover:bg-[#1c2f63] text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        [disabled]="cargando"
      >
        <svg *ngIf="!cargando" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
        <svg *ngIf="cargando" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        {{ textoBoton }}
      </button>

      <button
        (click)="limpiar()"
        title="Limpiar filtros"
        class="text-[#54617f] hover:text-[#07153a] hover:bg-[#eef1f6] py-2 px-3 rounded-lg transition-colors cursor-pointer"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"></polyline>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
        </svg>
      </button>
    </div>
  `
})
export class BuscadorRangoFechas {
  @Input() placeholder: string = 'Buscar…';
  @Input() textoBoton: string = 'Buscar';
  @Input() cargando: boolean = false;

  @Input() set fechaDesdeInicial(v: string) { this.fechaDesde = v ?? ''; }
  @Input() set fechaHastaInicial(v: string) { this.fechaHasta = v ?? ''; }
  @Input() set filtroInicial(v: string) { this.filtro = v ?? ''; }

  @Output() buscar = new EventEmitter<CriteriosBusqueda>();
  @Output() limpiarFiltros = new EventEmitter<void>();

  filtro = '';
  fechaDesde = '';
  fechaHasta = '';

  emitirBusqueda() {
    if (this.fechaDesde && this.fechaHasta && this.fechaDesde > this.fechaHasta) {
      [this.fechaDesde, this.fechaHasta] = [this.fechaHasta, this.fechaDesde];
    }
    this.buscar.emit({
      filtro: this.filtro.trim(),
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta
    });
  }

  limpiar() {
    this.filtro = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.limpiarFiltros.emit();
  }
}