import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvolucionService } from '../../servicios/evolucion.service';
import { BuscadorRangoFechas, CriteriosBusqueda } from '../../../../compartido/ui/buscador-rango-fechas/buscador-rango-fechas';
import { PaginacionComponent } from '../../../../compartido/ui/paginacion/paginacion';

@Component({
  selector: 'app-bandeja-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, BuscadorRangoFechas, PaginacionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col min-h-[calc(100vh-62px)] -mt-4 md:-mt-6 lg:-mt-8 -mx-4 md:-mx-6 lg:-mx-8">
      <!-- Barra de búsqueda (franja blanca pegada al header) -->
      <div class="bg-white border-b border-slate-200 px-4 md:px-6 lg:px-8 py-3">
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
        <aside class="p-3 md:px-6 lg:px-8">
          <div class="text-[10.5px] uppercase tracking-widest text-slate-500 px-1 pb-2">
            Pacientes activos
          </div>
          <div class="flex flex-col gap-0.5">
            @for (paciente of evolucionService.filteredPacientes(); track paciente.idRegAtencion) {
              <div 
                class="px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 ease-in-out hover:bg-slate-100 w-full"
                [class.bg-teal-50]="evolucionService.activePatient()?.idRegAtencion === paciente.idRegAtencion"
                (click)="evolucionService.selectPatient(paciente)"
              >
                <div class="font-semibold text-[13px] text-slate-900 break-words">{{ paciente.nombre }}</div>
                <div class="font-mono text-[10.8px] text-slate-500 mt-0.5 flex justify-between gap-2">
                  <span class="break-words"><b>HC:</b> {{ paciente.historia }}</span>
                  <span class="shrink-0">{{ evolucionService.normalizarEdad(paciente.edad) }}</span>
                </div>
                <div class="text-[10.5px] text-slate-400 mt-0.5 flex justify-between gap-2">
                  <span class="break-words">{{ paciente.ubicacion }}</span>
                  <span class="shrink-0">Cama: {{ paciente.cama }}</span>
                </div>
              </div>
            } @empty {
              <div class="text-center text-sm text-slate-500 py-4">No se encontraron pacientes.</div>
            }
          </div>
          <app-paginacion
            [page]="evolucionService.page()"
            [totalPages]="evolucionService.totalPages()"
            [totalItems]="evolucionService.totalItems()"
            (pageChange)="evolucionService.irAPagina($event)"
          />
        </aside>

      <!-- Main Area -->
      <main class="p-6 md:p-8 pb-16">
        @if (evolucionService.activePatient(); as paciente) {
          <!-- Banner del paciente con datos reales -->
          <div class="mb-5 pb-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div class="font-serif font-semibold text-2xl text-teal-900">{{ paciente.nombre }}</div>
              <div class="flex gap-4 flex-wrap text-[12.5px] text-slate-500 mt-1">
                <span><b>HC:</b> {{ paciente.historia }}</span>
                <span><b>Edad:</b> {{ evolucionService.normalizarEdad(paciente.edad) }}</span>
                <span><b>Sexo:</b> {{ paciente.sexo }}</span>
                <span><b>Ubicación:</b> {{ paciente.ubicacion }}</span>
                <span><b>Cama:</b> {{ paciente.cama }}</span>
              </div>
            </div>
            <button 
              (click)="evolucionService.setViewMode('form')"
              class="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              + Nueva Evolución
            </button>
          </div>

          <!-- Bandeja de evoluciones del paciente -->
          <div>
            <div class="px-1 py-3 flex items-center justify-between">
              <h3 class="text-[13px] font-semibold text-slate-700">Bandeja de evoluciones</h3>
              <span class="text-[11.5px] text-slate-500">Paciente: {{ paciente.nombre }}</span>
            </div>
            <div class="text-center py-14 text-slate-400">
              <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path>
              </svg>
              <p>Este paciente aún no tiene evoluciones registradas en el sistema.</p>
              <p class="text-[12.5px] mt-1">Use "Iniciar Evolución" para crear la primera nota.</p>
            </div>
          </div>
        } @else {
          <div class="text-center py-20 text-slate-400">
            <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1"></rect>
              <path d="M9 12h6"></path>
              <path d="M9 16h6"></path>
            </svg>
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
