import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { __decorate } from 'tslib';
import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';
import { TablaComponent } from '../../../../../compartido/componentes/tabla/tabla.component';
import { EvolucionService } from '../../../servicios/evolucion.service';
import { ResultadoService } from '../../../servicios/resultado.service';

let ResultadosComponent = class ResultadosComponent {
  formGroup;
  resultadoService = inject(ResultadoService);
  evolucionService = inject(EvolucionService);
  laboratorios = signal([]);
  imagenes = signal([]);
  isLoading = signal(false);
  errorMessage = signal('');
  columnasLaboratorio = [
    { campo: 'examenCustom', cabecera: 'Examen' },
    { campo: 'fechaCustom', cabecera: 'Fecha' },
    { campo: 'resultadoCustom', cabecera: 'Resultado / Detalle' },
    { campo: 'estadoCustom', cabecera: 'Estado' },
    { campo: 'revisadoCustom', cabecera: 'Revisado', alineacion: 'center' },
  ];
  columnasImagenes = [
    { campo: 'estudioCustom', cabecera: 'Estudio' },
    { campo: 'fechaCustom', cabecera: 'Fecha' },
    { campo: 'informeCustom', cabecera: 'Informe / Conclusión' },
    { campo: 'estadoCustom', cabecera: 'Estado' },
    { campo: 'revisadoCustom', cabecera: 'Revisado', alineacion: 'center' },
  ];
  ngOnInit() {
    this.cargarResultados();
  }
  async cargarResultados() {
    const paciente = this.evolucionService.activePatient();
    if (!paciente?.idPaciente) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const [labs, imgs] = await Promise.all([
        this.resultadoService.listarLaboratorio(paciente.idPaciente),
        this.resultadoService.listarImagenes(paciente.idPaciente),
      ]);
      this.laboratorios.set(labs);
      this.imagenes.set(imgs);
    } catch {
      this.errorMessage.set(
        'No se pudieron cargar los resultados. Intente nuevamente.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
  obtenerClaseEstado(estado) {
    const clases = {
      Normal: 'bg-green-100 text-green-700',
      Anormal: 'bg-red-100 text-red-700',
      Crítico: 'bg-red-200 text-red-900 font-bold',
      Pendiente: 'bg-slate-100 text-slate-500',
    };
    return clases[estado] ?? 'bg-slate-100 text-slate-500';
  }
};
__decorate(
  [Input({ required: true })],
  ResultadosComponent.prototype,
  'formGroup',
  void 0,
);
ResultadosComponent = __decorate(
  [
    Component({
      selector: 'app-resultados',
      standalone: true,
      imports: [
        CommonModule,
        ReactiveFormsModule,
        TablaComponent,
        ColumnaTemplateDirective,
      ],
      templateUrl: './resultados.html',
    }),
  ],
  ResultadosComponent,
);

export { ResultadosComponent };
