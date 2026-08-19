import { Component, Input } from '@angular/core';

export type EtiquetaVariante =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'blue';

@Component({
  selector: 'etiqueta',
  templateUrl: './etiqueta.html',
})
export class Etiqueta {
  @Input() variante: EtiquetaVariante = 'neutral';
  @Input() claseAdicional: string = '';

  clases: Record<EtiquetaVariante, string> = {
    success: 'bg-[#d1fae5] text-[#047857]',
    warning: 'bg-[#fef3c7] text-[#b45309]',
    danger: 'bg-[#fee2e2] text-[#dc2626]',
    info: 'bg-[#e0e7ff] text-[#3730a3]',
    neutral: 'bg-[#e2e8f0] text-[#475569]',
    blue: 'bg-[#dbeafe] text-[#1d4ed8]',
  };
}
