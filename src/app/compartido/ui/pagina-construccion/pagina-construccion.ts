import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-construccion',
  standalone: true,
  template: `
    <div class="min-h-[70vh] flex items-center justify-center">
      <div class="max-w-md w-full text-center">
        <div class="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#263c7a] to-[#0f1d4d] flex items-center justify-center shadow-lg shadow-[#263c7a]/20 mb-6">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
        <div class="text-[11px] font-semibold uppercase tracking-[.18em] text-[#7a86a1] mb-2">Módulo en desarrollo</div>
        <h2 class="m-0 text-[22px] font-bold text-[#07153a] mb-2">Esta vista aún no está disponible</h2>
        <p class="text-[13.5px] leading-relaxed text-[#5f6f9c] mb-1">
          La ruta <code class="px-1.5 py-0.5 rounded-md bg-[#eef1f8] text-[#263c7a] font-semibold text-[12px]">{{ ruta }}</code>
          está registrada en el menú del sistema, pero su pantalla todavía está en construcción.
        </p>
        <p class="text-[12.5px] text-[#94a0bd] mb-6">Puede regresar al inicio o seguir usando los módulos ya disponibles.</p>
        <div class="flex items-center justify-center gap-3">
          <button (click)="volver()" class="px-5 py-2.5 rounded-xl border border-[#e0e6f1] bg-white text-[13px] font-semibold text-[#54617f] hover:bg-[#f6f8fc] transition-colors cursor-pointer">Volver atrás</button>
          <button (click)="irAlInicio()" class="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#263c7a] to-[#0f1d4d] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-md shadow-[#263c7a]/25 cursor-pointer">Ir al inicio</button>
        </div>
      </div>
    </div>
  `
})
export class PaginaConstruccionComponent {
  private router = inject(Router);

  get ruta(): string {
    return this.router.url;
  }

  volver() {
    window.history.back();
  }

  irAlInicio() {
    this.router.navigate(['/dashboard']);
  }
}