import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  Input,
  type QueryList,
  type TemplateRef,
} from '@angular/core';
import { ColumnaTemplateDirective } from './columna-template.directive';

export interface ColumnaTabla {
  campo: string;
  cabecera: string;
  alineacion?: 'left' | 'center' | 'right';
  ancho?: string;
}

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla.component.html',
})
export class TablaComponent {
  @Input() columnas: ColumnaTabla[] = [];
  @Input() datos: unknown[] = [];
  @Input() cargando: boolean = false;
  @Input() mensajeCargando: string = 'Consultando...';
  @Input() mostrarFiltroRequerido: boolean = false;
  @Input() mensajeFiltroRequerido: string =
    'Realice una búsqueda para ver resultados.';
  @Input() mensajeVacio: string = 'No se encontraron resultados.';

  @ContentChildren(ColumnaTemplateDirective)
  templates!: QueryList<ColumnaTemplateDirective>;

  getTemplate(nombreColumna: string): TemplateRef<unknown> | null {
    if (!this.templates) return null;
    const directiva = this.templates.find(
      (t) => t.nombreColumna === nombreColumna,
    );
    return directiva ? directiva.template : null;
  }
}
