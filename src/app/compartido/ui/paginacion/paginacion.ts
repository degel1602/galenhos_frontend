import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between gap-4 text-[13px] flex-wrap py-3">
      <div class="text-slate-500">
        Página <strong class="text-slate-800">{{ page }}</strong> de <strong class="text-slate-800">{{ totalPages }}</strong>
        @if (showTotal) {
          <span class="text-slate-400"> (Total: {{ totalItems }})</span>
        }
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          (click)="irAPagina(1)"
          [disabled]="page <= 1"
          class="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-teal-700 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Primera página">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline>
          </svg>
        </button>

        <button
          type="button"
          (click)="irAPagina(page - 1)"
          [disabled]="page <= 1"
          class="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-teal-700 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Anterior">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        @for (pagina of paginasVisibles(); track pagina) {          <button
            type="button"
            (click)="irAPagina(pagina)"
            class="min-w-8 h-8 px-1.5 flex items-center justify-center rounded-md font-semibold transition-colors cursor-pointer"
            [class.bg-teal-600]="pagina === page"
            [class.text-white]="pagina === page"
            [class.text-slate-600]="pagina !== page"
            [class.hover:bg-teal-50]="pagina !== page"
            [class.hover:text-teal-700]="pagina !== page">
            {{ pagina }}
          </button>
        }

        <button
          type="button"
          (click)="irAPagina(page + 1)"
          [disabled]="page >= totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-teal-700 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Siguiente">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <button
          type="button"
          (click)="irAPagina(totalPages)"
          [disabled]="page >= totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-teal-700 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Última página">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class PaginacionComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() showTotal = true;
  @Output() pageChange = new EventEmitter<number>();

  private readonly maxBotones = 5;

  paginasVisibles(): number[] {
    const actual = this.page;
    const total = Math.max(1, this.totalPages);
    const mitad = Math.floor(this.maxBotones / 2);

    let inicio = actual - mitad;
    let fin = actual + mitad;

    if (inicio < 1) {
      fin += 1 - inicio;
      inicio = 1;
    }
    if (fin > total) {
      inicio = Math.max(1, fin - this.maxBotones + 1);
      fin = total;
    }
    if (fin < this.maxBotones) fin = Math.min(total, this.maxBotones);

    const paginas: number[] = [];
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  }

  irAPagina(nuevaPagina: number) {
    const total = Math.max(1, this.totalPages);
    if (nuevaPagina < 1 || nuevaPagina > total || nuevaPagina === this.page) return;
    this.pageChange.emit(nuevaPagina);
  }
}
