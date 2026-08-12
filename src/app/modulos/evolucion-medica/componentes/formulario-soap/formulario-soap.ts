import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvolucionService } from '../../servicios/evolucion.service';
import { SignosVitalesComponent } from './signos-vitales/signos-vitales';
import { DiagnosticosComponent } from './diagnosticos/diagnosticos';

@Component({
  selector: 'app-formulario-soap',
  standalone: true,
  imports: [CommonModule, SignosVitalesComponent, DiagnosticosComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (evolucionService.activePatient(); as paciente) {
      <!-- 1. INFORMACIÓN GENERAL (franja fija) -->
      <div class="bg-white border-b border-slate-200 p-3 md:p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        <div class="flex flex-col">
          <label class="text-[10.5px] uppercase tracking-widest text-slate-500 mb-1">N.º de evolución</label>
          <input type="text" value="EV-2026-000482" readonly class="w-full border border-slate-200 rounded-md p-1.5 font-mono text-[12.5px] bg-slate-50 text-slate-800">
        </div>
        <div class="flex flex-col">
          <label class="text-[10.5px] uppercase tracking-widest text-slate-500 mb-1">Fecha</label>
          <input type="date" value="2026-08-11" class="w-full border border-slate-200 rounded-md p-1.5 font-mono text-[12.5px] bg-slate-50 text-slate-800 focus:ring-1 focus:ring-teal-600 focus:outline-none">
        </div>
        <div class="flex flex-col">
          <label class="text-[10.5px] uppercase tracking-widest text-slate-500 mb-1">Hora</label>
          <input type="time" value="23:55" class="w-full border border-slate-200 rounded-md p-1.5 font-mono text-[12.5px] bg-slate-50 text-slate-800 focus:ring-1 focus:ring-teal-600 focus:outline-none">
        </div>
        <div class="flex flex-col">
          <label class="text-[10.5px] uppercase tracking-widest text-slate-500 mb-1">Tipo de atención</label>
          <select class="w-full border border-slate-200 rounded-md p-1.5 font-mono text-[12.5px] bg-slate-50 text-slate-800 focus:ring-1 focus:ring-teal-600 focus:outline-none">
            <option>Hospitalización</option>
            <option>Emergencia</option>
            <option>Consulta externa</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-[calc(100vh-130px)]">
        <!-- ===================== NAV ===================== -->
        <nav class="bg-white border-r border-slate-200 p-4 pb-10 overflow-y-auto">
          <div class="text-[10.5px] uppercase tracking-widest text-slate-500 p-3 pt-4">Encuentro</div>
          <div class="nav-item flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-[13.2px] transition-colors"
               [class.bg-teal-700]="activePanel() === 'p1'" [class.text-white]="activePanel() === 'p1'"
               [class.hover:bg-teal-50]="activePanel() !== 'p1'" [class.text-slate-800]="activePanel() !== 'p1'"
               (click)="activePanel.set('p1')">
            <span class="font-mono text-[11px]" [class.text-teal-200]="activePanel() === 'p1'" [class.text-slate-400]="activePanel() !== 'p1'">01</span> Información general
          </div>
          <div class="nav-item flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-[13.2px] transition-colors"
               [class.bg-teal-700]="activePanel() === 'p2'" [class.text-white]="activePanel() === 'p2'"
               [class.hover:bg-teal-50]="activePanel() !== 'p2'" [class.text-slate-800]="activePanel() !== 'p2'"
               (click)="activePanel.set('p2')">
            <span class="font-mono text-[11px]" [class.text-teal-200]="activePanel() === 'p2'" [class.text-slate-400]="activePanel() !== 'p2'">02</span> Motivo de evolución
          </div>

          <div class="text-[10.5px] uppercase tracking-widest text-slate-500 p-3 pt-4">Método SOAP</div>
          <div class="relative ml-1.5 pl-3.5 border-l-2 border-amber-100 flex flex-col gap-0.5">
            <div class="nav-item flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-[13.2px] transition-colors relative -ml-3.5 pl-6"
                 [class.bg-teal-700]="activePanel() === 'p3'" [class.text-white]="activePanel() === 'p3'"
                 [class.hover:bg-teal-50]="activePanel() !== 'p3'" [class.text-slate-800]="activePanel() !== 'p3'"
                 (click)="activePanel.set('p3')">
              <span class="absolute -left-2.5 w-4 h-4 rounded-full bg-amber-500 text-amber-950 font-mono text-[9.5px] font-bold flex items-center justify-center">S</span>
              <span class="font-mono text-[11px]" [class.text-teal-200]="activePanel() === 'p3'" [class.text-slate-400]="activePanel() !== 'p3'">03</span> Subjetivo
            </div>
            <div class="nav-item flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-[13.2px] transition-colors relative -ml-3.5 pl-6"
                 [class.bg-teal-700]="activePanel() === 'p4'" [class.text-white]="activePanel() === 'p4'"
                 [class.hover:bg-teal-50]="activePanel() !== 'p4'" [class.text-slate-800]="activePanel() !== 'p4'"
                 (click)="activePanel.set('p4')">
              <span class="absolute -left-2.5 w-4 h-4 rounded-full bg-amber-500 text-amber-950 font-mono text-[9.5px] font-bold flex items-center justify-center">O</span>
              <span class="font-mono text-[11px]" [class.text-teal-200]="activePanel() === 'p4'" [class.text-slate-400]="activePanel() !== 'p4'">04</span> Objetivo
            </div>
            <div class="nav-item flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-[13.2px] transition-colors relative"
                 [class.bg-teal-700]="activePanel() === 'p5'" [class.text-white]="activePanel() === 'p5'"
                 [class.hover:bg-teal-50]="activePanel() !== 'p5'" [class.text-slate-800]="activePanel() !== 'p5'"
                 (click)="activePanel.set('p5')">
              <span class="font-mono text-[11px]" [class.text-teal-200]="activePanel() === 'p5'" [class.text-slate-400]="activePanel() !== 'p5'">05</span> Resultados
            </div>
            <div class="nav-item flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-[13.2px] transition-colors relative -ml-3.5 pl-6"
                 [class.bg-teal-700]="activePanel() === 'p6'" [class.text-white]="activePanel() === 'p6'"
                 [class.hover:bg-teal-50]="activePanel() !== 'p6'" [class.text-slate-800]="activePanel() !== 'p6'"
                 (click)="activePanel.set('p6')">
              <span class="absolute -left-2.5 w-4 h-4 rounded-full bg-amber-500 text-amber-950 font-mono text-[9.5px] font-bold flex items-center justify-center">A</span>
              <span class="font-mono text-[11px]" [class.text-teal-200]="activePanel() === 'p6'" [class.text-slate-400]="activePanel() !== 'p6'">06</span> Evaluación
            </div>
            <div class="nav-item flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-[13.2px] transition-colors relative -ml-3.5 pl-6"
                 [class.bg-teal-700]="activePanel() === 'p7'" [class.text-white]="activePanel() === 'p7'"
                 [class.hover:bg-teal-50]="activePanel() !== 'p7'" [class.text-slate-800]="activePanel() !== 'p7'"
                 (click)="activePanel.set('p7')">
              <span class="absolute -left-2.5 w-4 h-4 rounded-full bg-amber-500 text-amber-950 font-mono text-[9.5px] font-bold flex items-center justify-center">P</span>
              <span class="font-mono text-[11px]" [class.text-teal-200]="activePanel() === 'p7'" [class.text-slate-400]="activePanel() !== 'p7'">07</span> Plan de tratamiento
            </div>
          </div>

          <div class="text-[10.5px] uppercase tracking-widest text-slate-500 p-3 pt-4 mt-2">Cierre</div>
          <div class="nav-item flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium text-[13.2px] transition-colors"
               [class.bg-teal-700]="activePanel() === 'p15'" [class.text-white]="activePanel() === 'p15'"
               [class.hover:bg-teal-50]="activePanel() !== 'p15'" [class.text-slate-800]="activePanel() !== 'p15'"
               (click)="activePanel.set('p15')">
            <span class="font-mono text-[11px]" [class.text-teal-200]="activePanel() === 'p15'" [class.text-slate-400]="activePanel() !== 'p15'">15</span> Firma y cierre
          </div>
        </nav>

        <!-- ===================== CONTENT ===================== -->
        <div class="p-6 md:p-8 pb-16 bg-slate-50">
          
          @if (activePanel() === 'p1') {
            <section class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-5">
                <span class="font-mono text-[11px] text-amber-600 uppercase tracking-widest">Sección 01</span>
                <h2 class="font-serif font-semibold text-2xl mt-1 mb-1 text-teal-950">Información general</h2>
                <p class="text-slate-500 text-[13px] m-0">Estos datos ya están capturados en la franja superior y se aplican a toda la nota de evolución.</p>
              </div>
              <div class="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm">
                <h3 class="text-sm font-semibold text-teal-950 flex items-center gap-2 mb-3">
                  <span class="w-1 h-3.5 bg-amber-500 rounded-sm inline-block"></span>
                  Paciente: {{ paciente.nombre }}
                </h3>
                <p class="text-slate-500 text-[13px]">Verifique en el panel superior que el estado de atención y el médico tratante sean correctos antes de continuar con la evolución del paciente.</p>
              </div>
            </section>
          }

          @if (activePanel() === 'p2') {
            <section class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-5">
                <span class="font-mono text-[11px] text-amber-600 uppercase tracking-widest">Sección 02</span>
                <h2 class="font-serif font-semibold text-2xl mt-1 mb-1 text-teal-950">Motivo de evolución</h2>
                <p class="text-slate-500 text-[13px] m-0">Seleccione el motivo que origina este registro.</p>
              </div>
              <div class="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm">
                <h3 class="text-sm font-semibold text-teal-950 flex items-center gap-2 mb-3">
                  <span class="w-1 h-3.5 bg-amber-500 rounded-sm inline-block"></span>
                  Motivo
                </h3>
                <div class="flex flex-wrap gap-2 mb-4">
                  <label class="flex items-center gap-1.5 text-[13px] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" class="accent-teal-600"> Seguimiento
                  </label>
                  <label class="flex items-center gap-1.5 text-[13px] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" class="accent-teal-600"> Emergencia
                  </label>
                  <label class="flex items-center gap-1.5 text-[13px] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" class="accent-teal-600"> Interconsulta
                  </label>
                </div>
                <div class="flex flex-col">
                  <label class="text-[11.5px] font-semibold text-slate-500 mb-1">Detalle del motivo</label>
                  <textarea rows="3" class="w-full border border-slate-200 rounded-md p-2.5 text-[13.3px] bg-slate-50 text-slate-800 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all resize-y" placeholder="Especifique brevemente el motivo..."></textarea>
                </div>
              </div>
            </section>
          }

          @if (activePanel() === 'p3') {
            <section class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-5">
                <span class="font-mono text-[11px] text-amber-600 uppercase tracking-widest">Sección 03 · Método SOAP</span>
                <h2 class="font-serif font-semibold text-2xl mt-1 mb-1 text-teal-950">Subjetivo (S)</h2>
                <p class="text-slate-500 text-[13px] m-0">Lo que refiere el paciente.</p>
              </div>
              <div class="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm text-center py-10 text-slate-400">
                 Área de contenido Subjetivo
              </div>
            </section>
          }

          @if (activePanel() === 'p4') {
            <section class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-5">
                <span class="font-mono text-[11px] text-amber-600 uppercase tracking-widest">Sección 04 · Método SOAP</span>
                <h2 class="font-serif font-semibold text-2xl mt-1 mb-1 text-teal-950">Objetivo (O)</h2>
                <p class="text-slate-500 text-[13px] m-0">Signos vitales y hallazgos del examen físico.</p>
              </div>
              
              <app-signos-vitales />

            </section>
          }

          @if (activePanel() === 'p6') {
            <section class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-5">
                <span class="font-mono text-[11px] text-amber-600 uppercase tracking-widest">Sección 06 · Método SOAP</span>
                <h2 class="font-serif font-semibold text-2xl mt-1 mb-1 text-teal-950">Evaluación (A)</h2>
                <p class="text-slate-500 text-[13px] m-0">Interpretación clínica de la evolución y diagnósticos.</p>
              </div>
              
              <div class="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col">
                    <label class="text-[11.5px] font-semibold text-slate-500 mb-1">Estado clínico</label>
                    <select class="w-full border border-slate-200 rounded-md p-2.5 text-[13.3px] bg-slate-50 text-slate-800 focus:ring-1 focus:ring-teal-600 focus:outline-none">
                      <option>Mejoría</option>
                      <option>Estacionario</option>
                      <option>Empeoramiento</option>
                      <option>Resuelto</option>
                    </select>
                  </div>
                  <div class="flex flex-col">
                    <label class="text-[11.5px] font-semibold text-slate-500 mb-1">Pronóstico</label>
                    <select class="w-full border border-slate-200 rounded-md p-2.5 text-[13.3px] bg-slate-50 text-slate-800 focus:ring-1 focus:ring-teal-600 focus:outline-none">
                      <option>Bueno</option>
                      <option>Reservado</option>
                      <option>Malo</option>
                    </select>
                  </div>
                </div>
              </div>

              <app-diagnosticos />

            </section>
          }

          @if (activePanel() === 'p7') {
            <section class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-5">
                <span class="font-mono text-[11px] text-amber-600 uppercase tracking-widest">Sección 07 · Método SOAP</span>
                <h2 class="font-serif font-semibold text-2xl mt-1 mb-1 text-teal-950">Plan (P)</h2>
                <p class="text-slate-500 text-[13px] m-0">Plan de tratamiento, indicaciones y próximos pasos.</p>
              </div>
              <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center py-12 text-slate-400">
                Área de contenido para Plan de tratamiento (indicaciones médicas).
              </div>
            </section>
          }

          @if (activePanel() === 'p15') {
            <section class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-5">
                <span class="font-mono text-[11px] text-teal-600 uppercase tracking-widest">Cierre</span>
                <h2 class="font-serif font-semibold text-2xl mt-1 mb-1 text-teal-950">Firma y cierre de documento</h2>
                <p class="text-slate-500 text-[13px] m-0">El documento se firmará y ya no se podrá modificar posteriormente.</p>
              </div>
              <div class="bg-teal-50 border border-teal-100 rounded-xl p-6 shadow-sm text-center">
                <div class="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-teal-950 text-lg mb-2">Finalizar evolución</h3>
                <p class="text-teal-800 text-sm max-w-md mx-auto mb-6">Al firmar digitalmente la nota, se cerrará el registro y se anexará permanentemente a la historia clínica del paciente. Esta acción es irreversible.</p>
                <button class="bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-teal-800 transition-colors">
                  Firmar documento y guardar
                </button>
              </div>
            </section>
          }

        </div>
      </div>
    }
  `
})
export class FormularioSoapComponent {
  public evolucionService = inject(EvolucionService);
  public activePanel = signal<string>('p1');
}
