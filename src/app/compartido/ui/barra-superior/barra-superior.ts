import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'barra-superior',
  template: `
    <header class="h-[66px] shrink-0 bg-white border-b border-[#e3e8f2] flex items-center justify-between px-[30px]">
      <div class="flex items-center gap-4">
        <button (click)="onToggleSidebar.emit()" class="p-2 -ml-2 rounded-lg text-[#5f6f9c] hover:bg-[#f3f5fb] hover:text-[#07153a] transition-colors cursor-pointer" title="Alternar menú lateral">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div>
          <div class="text-[11px] text-[#94a0bd] font-medium tracking-[.04em]">GALENOS PRO</div>
          <h2 class="m-0 mt-[1px] text-[19px] font-bold text-[#07153a]">{{ title }}</h2>
        </div>
      </div>
      <div class="flex items-center gap-[14px]">
        <div class="flex items-center gap-[9px] bg-[#f3f5fb] border border-[#e6eaf5] px-3.5 py-[7px] rounded-xl">
          <span class="w-2 h-2 rounded-full bg-[#059669]"></span>
          <span class="text-[13px] font-semibold text-[#07153a]">{{ username || 'Operador' }}</span>
        </div>
      </div>
    </header>
  `
})
export class BarraSuperior {
  @Input() title: string = '';
  @Input() username: string | null = null;
  @Output() onToggleSidebar = new EventEmitter<void>();
}
