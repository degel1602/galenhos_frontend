import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paginacion.html',
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
    if (nuevaPagina < 1 || nuevaPagina > total || nuevaPagina === this.page)
      return;
    this.pageChange.emit(nuevaPagina);
  }
}
