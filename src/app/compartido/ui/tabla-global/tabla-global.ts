import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  type TemplateRef,
} from '@angular/core';

export interface ColumnaTabla {
  nombre: string;
  campo?: string;
  alineacion?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-tabla-global',
  standalone: true,
  imports: [NgTemplateOutlet, NgClass],
  templateUrl: './tabla-global.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaGlobal {
  @Input({ required: true }) columnas: ColumnaTabla[] = [];
  @Input({ required: true }) data: unknown[] = [];
  @Input({ required: true }) rowTemplate!: TemplateRef<unknown>;

  @Input() totalRegistros: number = 0;
  @Input() registrosPorPagina: number = 10;
  @Input() paginaActual: number = 1;
}
