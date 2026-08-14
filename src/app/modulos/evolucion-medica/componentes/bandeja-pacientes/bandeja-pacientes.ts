import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvolucionService } from '../../servicios/evolucion.service';
import { BuscadorRangoFechas, CriteriosBusqueda } from '../../../../compartido/ui/buscador-rango-fechas/buscador-rango-fechas';
import { AuthService } from '../../../auth/aplicacion/auth.service';

@Component({
  selector: 'app-bandeja-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, BuscadorRangoFechas],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col min-h-[calc(100vh-62px)]">
      <!-- Barra de búsqueda (sin caja) -->
      <div class="px-4 py-3">
        <buscador-rango-fechas
          placeholder="Buscar paciente o N.º HC..."
          [cargando]="evolucionService.isLoading()"
          [filtroInicial]="evolucionService.patientSearch()"
          [fechaDesdeInicial]="evolucionService.fechaDesde()"
          [fechaHastaInicial]="evolucionService.fechaHasta()"
          (buscar)="onBuscar($event)"
          (limpiarFiltros)="onLimpiar()"
        ></buscador-rango-fechas>
      </div>

<div class="grid grid-cols-1 md:grid-cols-[300px_1fr] flex-1">
        <!-- Rail Lateral (sin caja) -->
        <aside class="p-3">
          <div class="text-[10.5px] uppercase tracking-widest text-slate-500 px-1 pb-2">
            Pacientes activos
          </div>
          <div class="flex flex-col gap-0.5">
            @for (paciente of evolucionService.filteredPacientes(); track paciente.idRegAtencion) {
              <div 
                class="px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 ease-in-out hover:bg-slate-100"
                [class.bg-teal-50]="evolucionService.activePatient()?.idRegAtencion === paciente.idRegAtencion"
                (click)="evolucionService.selectPatient(paciente)"
              >
                <div class="font-semibold text-[13px] text-slate-900">{{ paciente.nombre }}</div>
                <div class="font-mono text-[10.8px] text-slate-500 mt-0.5 flex justify-between">
                  <span>{{ paciente.historia }}</span>
                  <span>{{ paciente.edad }}</span>
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
            @if (authService.hasPermission('agregar') || authService.hasPermission('modificar')) {
              <button 
                (click)="evolucionService.setViewMode('form')"
                class="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Iniciar Evolución
              </button>
            }
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
                    @if (authService.hasPermission('ver')) {
                      <button class="text-teal-700 border border-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Ver</button>
                    }
                  </td>
                </tr>
                <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td class="p-3 align-middle font-mono text-[12px]">25/07/2026</td>
                  <td class="p-3 align-middle">
                    <span class="font-mono text-[10.5px] px-2 py-1 rounded-full bg-teal-50 text-teal-800 font-semibold">Ingreso</span>
                  </td>
                  <td class="p-3 align-middle text-slate-600">Dra. Ramírez</td>
                  <td class="p-3 align-middle text-right">
                    @if (authService.hasPermission('ver')) {
                      <button class="text-teal-700 border border-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">Ver</button>
                    }
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
    </div>
  `
})
export class BandejaPacientesComponent {
  public evolucionService = inject(EvolucionService);
  public authService = inject(AuthService);

  onBuscar(criterios: CriteriosBusqueda) {
    this.evolucionService.patientSearch.set(criterios.filtro);
    this.evolucionService.fechaDesde.set(criterios.fechaDesde);
    this.evolucionService.fechaHasta.set(criterios.fechaHasta);
    this.evolucionService.cargarPacientes();
  }

  onLimpiar() {
    this.evolucionService.patientSearch.set('');
    this.evolucionService.fechaDesde.set('');
    this.evolucionService.fechaHasta.set('');
    this.evolucionService.cargarPacientes();
  }
}
