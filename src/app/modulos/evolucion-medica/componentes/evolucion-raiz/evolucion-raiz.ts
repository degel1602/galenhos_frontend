import { Component, ChangeDetectionStrategy, inject, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvolucionService } from '../../servicios/evolucion.service';
import { BandejaPacientesComponent } from '../bandeja-pacientes/bandeja-pacientes';
import { FormularioSoapComponent } from '../formulario-soap/formulario-soap';
import { HeaderActionsService } from '../../../../compartido/servicios/header-actions.service';
import { AuthService } from '../../../auth/aplicacion/auth.service';

@Component({
  selector: 'app-evolucion-raiz',
  standalone: true,
  imports: [CommonModule, BandejaPacientesComponent, FormularioSoapComponent],
  providers: [EvolucionService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styles: [':host { display: block; }'],
  template: `
    <div class="min-h-full bg-slate-50 text-slate-800 font-sans">
      <ng-template #headerActions>
        <div class="flex gap-2.5 items-center">
          @if (evolucionService.viewMode() === 'tray') {
            <span class="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Bandeja de evoluciones
            </span>
          } @else {
            <button 
              (click)="evolucionService.clearSelection()"
              class="font-semibold text-[13px] px-3.5 py-2 rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
            >
              ← Volver a la bandeja
            </button>
            <span class="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Nota en borrador
            </span>
            @if (authService.hasPermission('imprimir')) {
              <button class="font-semibold text-[13px] px-3.5 py-2 rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm ml-2">
                Imprimir / PDF
              </button>
            }
            @if (authService.hasPermission('agregar') || authService.hasPermission('modificar')) {
              <button class="font-semibold text-[13px] px-3.5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
                Guardar evolución
              </button>
            }
          }
        </div>
      </ng-template>

      <!-- Main Content Area -->
      <div class="relative">
        @if (evolucionService.viewMode() === 'tray') {
          <app-bandeja-pacientes class="animate-in fade-in zoom-in-95 duration-200 block" />
        } @else {
          <app-formulario-soap class="animate-in fade-in slide-in-from-right-4 duration-200 block" />
        }
      </div>
    </div>
  `
})
export class EvolucionRaizComponent implements AfterViewInit, OnDestroy {
  evolucionService = inject(EvolucionService);
  headerActionsService = inject(HeaderActionsService);
  authService = inject(AuthService);
  
  @ViewChild('headerActions') headerActionsTpl!: TemplateRef<unknown>;

  ngAfterViewInit() {
    setTimeout(() => {
      this.headerActionsService.setTemplate(this.headerActionsTpl);
    });
    this.evolucionService.cargarPacientes();
  }

  ngOnDestroy() {
    this.headerActionsService.setTemplate(null);
  }
}
