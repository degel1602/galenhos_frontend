import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ventana-modal',
  template: `
    <div class="fixed inset-0 bg-[#07153a]/45 flex items-center justify-center p-6 z-[100]" (click)="cerrar()">
      <div 
        (click)="$event.stopPropagation()"
        class="w-full max-h-[90vh] overflow-hidden bg-white rounded-[18px] shadow-[0_20px_60px_rgba(7,21,58,0.3)] flex flex-col"
        [style.max-width.px]="ancho">
        
        <div class="flex items-start justify-between px-6 py-5 border-b border-[#eef1f6] shrink-0 bg-white rounded-t-[18px]">
          <div class="min-w-0">
            <div class="text-base font-bold text-[#07153a] truncate">{{ titulo }}</div>
            @if (subtitulo) {
              <div class="text-[12.5px] text-[#7a86a1] mt-[3px]">{{ subtitulo }}</div>
            }
          </div>
          <button
            (click)="cerrar()"
            class="w-8 h-8 rounded-[9px] border border-[#e0e6f1] bg-white cursor-pointer flex items-center justify-center text-[#54617f] shrink-0 transition-colors hover:bg-gray-50 ml-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto min-w-0">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
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
