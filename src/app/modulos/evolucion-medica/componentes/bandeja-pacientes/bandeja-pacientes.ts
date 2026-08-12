import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvolucionService, PacienteMock } from '../../servicios/evolucion.service';

@Component({
  selector: 'app-bandeja-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-[300px_1fr] min-h-[calc(100vh-62px)]">
      <!-- Rail Lateral -->
      <aside class="bg-white border-r border-slate-200 p-4 pb-10">
        <input 
          type="text" 
          class="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm mb-4 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all" 
          placeholder="Buscar paciente o N.º HC..."
          [ngModel]="evolucionService.patientSearch()"
          (ngModelChange)="evolucionService.patientSearch.set($event)"
        >
        <div class="text-[10.5px] uppercase tracking-widest text-slate-500 px-1 pb-2">
          Pacientes activos
        </div>
        <div class="flex flex-col gap-2">
          @for (paciente of evolucionService.filteredPacientes(); track paciente.id) {
            <div 
              class="border rounded-xl p-3 cursor-pointer bg-white transition-colors duration-150 ease-in-out hover:border-teal-600"
              [class.bg-teal-50]="evolucionService.activePatient()?.id === paciente.id"
              [class.border-teal-600]="evolucionService.activePatient()?.id === paciente.id"
              [class.border-slate-200]="evolucionService.activePatient()?.id !== paciente.id"
              (click)="evolucionService.selectPatient(paciente)"
            >
              <div class="font-bold text-[13.5px] text-slate-900">{{ paciente.nombre }}</div>
              <div class="font-mono text-[10.8px] text-slate-500 mt-1 flex justify-between">
                <span>{{ paciente.historia }}</span>
                <span>{{ paciente.edad }}</span>
              </div>
              <div class="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>{{ paciente.ubicacion }}</span>
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  [ngClass]="{
                    'bg-emerald-100 text-emerald-700': paciente.estado === 'Estable',
                    'bg-amber-100 text-amber-700': paciente.estado === 'Delicado',
                    'bg-rose-100 text-rose-700': paciente.estado === 'Crítico'
                  }"
                >{{ paciente.estado }}</span>
              </div>
            </div>
          } @empty {
            <div class="text-center text-sm text-slate-500 py-4">No se encontraron pacientes.</div>
          }
        </div>
      </aside>

      <!-- Main Area -->
      <main class="p-6 md:p-8 pb-16">
        @if (evolucionService.activePatient(); as paciente) {
          <!-- Estado vacío antes de iniciar el form o detalle del paciente -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 md:p-6 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div>
              <div class="font-serif font-semibold text-2xl text-teal-900">{{ paciente.nombre }}</div>
              <div class="flex gap-4 flex-wrap text-[12.5px] text-slate-500 mt-1">
                <span><b>HC:</b> {{ paciente.historia }}</span>
                <span><b>Edad:</b> {{ paciente.edad }}</span>
                <span><b>Sexo:</b> {{ paciente.sexo }}</span>
              </div>
            </div>
            <button 
              (click)="evolucionService.setViewMode('form')"
              class="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Iniciar Evolución
            </button>
          </div>

          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-[13px] text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b-2 border-slate-200">
                  <th class="text-[10.8px] uppercase tracking-wider text-slate-500 p-3 font-semibold">Fecha</th>
                  <th class="text-[10.8px] uppercase tracking-wider text-slate-500 p-3 font-semibold">Tipo</th>
                  <th class="text-[10.8px] uppercase tracking-wider text-slate-500 p-3 font-semibold">Médico</th>
                  <th class="text-[10.8px] uppercase tracking-wider text-slate-500 p-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td class="p-3 align-middle font-mono text-[12px]">26/07/2026</td>
                  <td class="p-3 align-middle">
                    <span class="font-mono text-[10.5px] px-2 py-1 rounded-full bg-teal-50 text-teal-800 font-semibold">Evolución</span>
                  </td>
                  <td class="p-3 align-middle text-slate-600">Dr. Gómez</td>
                  <td class="p-3 align-middle text-right">
                    <button class="text-teal-700 border border-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Ver</button>
                  </td>
                </tr>
                <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td class="p-3 align-middle font-mono text-[12px]">25/07/2026</td>
                  <td class="p-3 align-middle">
                    <span class="font-mono text-[10.5px] px-2 py-1 rounded-full bg-teal-50 text-teal-800 font-semibold">Ingreso</span>
                  </td>
                  <td class="p-3 align-middle text-slate-600">Dra. Ramírez</td>
                  <td class="p-3 align-middle text-right">
                    <button class="text-teal-700 border border-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Ver</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        } @else {
          <div class="text-center py-20 text-slate-400">
            <div class="text-4xl mb-3">📋</div>
            <p>Seleccione un paciente de la lista para ver su historial o iniciar una evolución.</p>
          </div>
        }
      </main>
    </div>
  `
})
export class BandejaPacientesComponent {
  public evolucionService = inject(EvolucionService);
}
