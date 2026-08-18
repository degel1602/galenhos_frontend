import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColumnaTemplateDirective } from '../../../../compartido/componentes/tabla/columna-template.directive';
import {
  type ColumnaTabla,
  TablaComponent,
} from '../../../../compartido/componentes/tabla/tabla.component';
import {
  BuscadorRangoFechas,
  type CriteriosBusqueda,
} from '../../../../compartido/ui/buscador-rango-fechas/buscador-rango-fechas';
import { PaginacionComponent } from '../../../../compartido/ui/paginacion/paginacion';
import {
  type EvolucionFirma,
  EvolucionService,
} from '../../servicios/evolucion.service';
import { VerEvolucionComponent } from './ver-evolucion/ver-evolucion';

@Component({
  selector: 'app-bandeja-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BuscadorRangoFechas,
    PaginacionComponent,
    VerEvolucionComponent,
    TablaComponent,
    ColumnaTemplateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col min-h-[calc(100vh-98px)] md:min-h-[calc(100vh-114px)] lg:min-h-[calc(100vh-130px)] -mt-4 md:-mt-6 lg:-mt-8 -mx-4 md:-mx-6 lg:-mx-8">
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
          <div class="text-[10.5px] uppercase tracking-widest text-slate-500 px-1 pb-1.5">
            Pacientes activos
          </div>
          <div class="flex flex-col gap-0.5">
            @for (paciente of evolucionService.filteredPacientes(); track paciente.idRegAtencion) {
              <div 
                class="px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 ease-in-out hover:bg-slate-100 w-full"
                [class.bg-teal-50]="evolucionService.activePatient()?.idRegAtencion === paciente.idRegAtencion"
                (click)="evolucionService.selectPatient(paciente)"
              >
                <div class="font-semibold text-[13px] text-slate-900 break-words leading-snug">{{ paciente.nombre }}</div>
                <div class="font-mono text-[10.8px] text-slate-500 mt-0.5 flex justify-between gap-2 leading-none">
                  <span class="break-words"><b>HC:</b> {{ paciente.historia }}</span>
                  <span class="shrink-0">{{ evolucionService.normalizarEdad(paciente.edad) }}</span>
                </div>
                <div class="text-[10.5px] text-slate-400 mt-0.5 flex justify-between gap-2 leading-none">
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

            @if (evolucionesCargando()) {
              <div class="flex justify-center items-center py-14 gap-3 text-slate-500">
                <svg class="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-[13px]">Cargando evoluciones...</span>
              </div>
            } @else if (evolucionesPaciente().length === 0) {
              <div class="text-center py-14 text-slate-400">
                <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path>
                </svg>
                <p>Este paciente aún no tiene evoluciones registradas en el sistema.</p>
                <p class="text-[12.5px] mt-1">Use "Nueva Evolución" para crear la primera nota.</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <app-tabla [columnas]="columnasEvoluciones" [datos]="evolucionesPaciente()" [cargando]="false"
                           mensajeVacio="Este paciente aún no tiene evoluciones registradas en el sistema.">

                  <ng-template appColumnaTemplate="numeroCustom" let-evolucion let-i="index">
                    <span class="font-mono text-[11.5px] text-slate-500">{{ i + 1 }}</span>
                  </ng-template>

                  <ng-template appColumnaTemplate="fechaCustom" let-evolucion>
                    <span class="font-mono text-[11.5px] text-slate-600">{{ evolucion.fechaRegistro | date:'dd/MM/yyyy HH:mm' }}</span>
                  </ng-template>

                  <ng-template appColumnaTemplate="medicoCustom" let-evolucion>
                    <span class="font-medium text-slate-800">{{ obtenerMedico(evolucion) }}</span>
                  </ng-template>

                  <ng-template appColumnaTemplate="estadoCustom" let-evolucion>
                    <span class="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-green-100 text-green-700 border border-green-200">Firmada</span>
                  </ng-template>

                  <ng-template appColumnaTemplate="accionesCustom" let-evolucion>
                    <button
                      type="button"
                      (click)="verEvolucion(evolucion)"
                      class="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-teal-600 hover:text-teal-800 hover:underline transition-colors cursor-pointer">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Ver
                    </button>
                  </ng-template>

                </app-tabla>
              </div>
            }
          </div>

          @if (evolucionDetalle(); as detalle) {
            <div class="fixed inset-0 bg-[#07153a]/45 flex items-center justify-center p-6 z-[110]" (click)="cerrarDetalle()">
              <div (click)="$event.stopPropagation()" class="w-full max-w-3xl max-h-[85vh] overflow-hidden bg-white rounded-2xl shadow-[0_20px_60px_rgba(7,21,58,0.3)] flex flex-col">
                <div class="flex items-start justify-between px-6 py-4 border-b border-slate-200 shrink-0">
                  <div class="min-w-0">
                    <div class="text-base font-bold text-[#07153a]">Evolución N.º {{ detalle.idFirma }}</div>
                    <div class="text-[12.5px] text-[#7a86a1] mt-0.5">Firmada el {{ detalle.fechaRegistro | date:'dd/MM/yyyy HH:mm' }}</div>
                  </div>
                  <button (click)="cerrarDetalle()" class="w-8 h-8 rounded-lg border border-slate-200 bg-white cursor-pointer flex items-center justify-center text-slate-500 shrink-0 transition-colors hover:bg-slate-50 ml-3" aria-label="Cerrar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div class="p-6 overflow-y-auto min-w-0">
                  <app-ver-evolucion [detalle]="detalle"></app-ver-evolucion>
                </div>
              </div>
            </div>
          }
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
  `,
})
export class BandejaPacientesComponent {
  public evolucionService = inject(EvolucionService);

  public readonly evolucionesPaciente = signal<EvolucionFirma[]>([]);
  public readonly evolucionesCargando = signal<boolean>(false);
  public readonly evolucionDetalle = signal<
    (EvolucionFirma & Record<string, unknown>) | null
  >(null);

  columnasEvoluciones: ColumnaTabla[] = [
    { campo: 'numeroCustom', cabecera: 'N.º' },
    { campo: 'fechaCustom', cabecera: 'Fecha de firma' },
    { campo: 'medicoCustom', cabecera: 'Médico' },
    { campo: 'estadoCustom', cabecera: 'Estado' },
    { campo: 'accionesCustom', cabecera: 'Acciones' },
  ];

  constructor() {
    effect(() => {
      const paciente = this.evolucionService.activePatient();
      if (paciente) {
        this.cargarEvoluciones();
      }
    });
  }

  async cargarEvoluciones(): Promise<void> {
    const paciente = this.evolucionService.activePatient();
    if (!paciente?.idRegAtencion) return;

    this.evolucionesCargando.set(true);
    try {
      const evoluciones = await this.evolucionService.listarEvoluciones(
        paciente.idRegAtencion,
      );
      this.evolucionesPaciente.set(evoluciones);
    } finally {
      this.evolucionesCargando.set(false);
    }
  }

  verEvolucion(evolucion: EvolucionFirma): void {
    const decodificada = this.evolucionService.decodificarEvolucion(
      evolucion.dataB64,
    );
    if (!decodificada) return;
    this.evolucionDetalle.set({
      ...evolucion,
      ...decodificada,
    } as EvolucionFirma & Record<string, unknown>);
  }

  cerrarDetalle(): void {
    this.evolucionDetalle.set(null);
  }

  obtenerMedico(evolucion: EvolucionFirma): string {
    const decodificada = this.evolucionService.decodificarEvolucion(
      evolucion.dataB64,
    );
    return (
      (decodificada as { cabecera?: { medicoTratante?: string } })?.cabecera
        ?.medicoTratante || `Empleado #${evolucion.idEmpleadoRegistra}`
    );
  }

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
