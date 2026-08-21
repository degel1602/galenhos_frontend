import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-botones-filtro',
  standalone: true,
  template: `
    <div class="flex gap-2 shrink-0">
      <button type="button" 
        (click)="buscar.emit()" 
        class="shrink-0 inline-flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm focus:ring-4 focus:ring-blue-100 disabled:opacity-50" 
        title="Buscar" 
        [disabled]="cargando">
        @if (cargando) {
          <svg aria-hidden="true" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
        } @else {
          <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        }
      </button>
      
      @if (mostrarLimpiar) {
        <button type="button" 
          (click)="limpiar.emit()" 
          class="shrink-0 inline-flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200 focus:ring-4 focus:ring-slate-100 disabled:opacity-50" 
          title="Limpiar filtros" 
          [disabled]="cargando">
          <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      }
    </div>
  `,
})
export class BotonesFiltroComponent {
  @Input() cargando = false;
  @Input() mostrarLimpiar = true;
  @Output() buscar = new EventEmitter<void>();
  @Output() limpiar = new EventEmitter<void>();
}
