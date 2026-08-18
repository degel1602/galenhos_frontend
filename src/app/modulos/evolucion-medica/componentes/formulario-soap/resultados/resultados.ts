import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ResultadoService, ResultadoInfo } from '../../../servicios/resultado.service';
import { EvolucionService } from '../../../servicios/evolucion.service';
import { TablaComponent, ColumnaTabla } from '../../../../../compartido/componentes/tabla/tabla.component';
import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablaComponent, ColumnaTemplateDirective],
  templateUrl: './resultados.html'
})
export class ResultadosComponent implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup;

  private readonly resultadoService = inject(ResultadoService);
  private readonly evolucionService = inject(EvolucionService);

  public readonly laboratorios = signal<ResultadoInfo[]>([]);
  public readonly imagenes = signal<ResultadoInfo[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');

  columnasLaboratorio: ColumnaTabla[] = [
    { campo: 'examenCustom', cabecera: 'Examen' },
    { campo: 'fechaCustom', cabecera: 'Fecha' },
    { campo: 'resultadoCustom', cabecera: 'Resultado / Detalle' },
    { campo: 'estadoCustom', cabecera: 'Estado' },
    { campo: 'revisadoCustom', cabecera: 'Revisado', alineacion: 'center' }
  ];

  columnasImagenes: ColumnaTabla[] = [
    { campo: 'estudioCustom', cabecera: 'Estudio' },
    { campo: 'fechaCustom', cabecera: 'Fecha' },
    { campo: 'informeCustom', cabecera: 'Informe / Conclusión' },
    { campo: 'estadoCustom', cabecera: 'Estado' },
    { campo: 'revisadoCustom', cabecera: 'Revisado', alineacion: 'center' }
  ];

  ngOnInit(): void {
    this.cargarResultados();
  }

  async cargarResultados(): Promise<void> {
    const paciente = this.evolucionService.activePatient();
    if (!paciente?.idPaciente) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const [labs, imgs] = await Promise.all([
        this.resultadoService.listarLaboratorio(paciente.idPaciente),
        this.resultadoService.listarImagenes(paciente.idPaciente)
      ]);
      this.laboratorios.set(labs);
      this.imagenes.set(imgs);
    } catch {
      this.errorMessage.set('No se pudieron cargar los resultados. Intente nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  obtenerClaseEstado(estado: string): string {
    const clases: Record<string, string> = {
      Normal: 'bg-green-100 text-green-700',
      Anormal: 'bg-red-100 text-red-700',
      Crítico: 'bg-red-200 text-red-900 font-bold',
      Pendiente: 'bg-slate-100 text-slate-500'
    };
    return clases[estado] ?? 'bg-slate-100 text-slate-500';
  }
}

