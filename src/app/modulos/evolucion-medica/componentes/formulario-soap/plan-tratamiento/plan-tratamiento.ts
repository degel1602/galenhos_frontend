import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../../auth/aplicacion/auth.service';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';
import { TablaComponent, ColumnaTabla } from '../../../../../compartido/componentes/tabla/tabla.component';
import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';

@Component({
  selector: 'app-plan-tratamiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMensajeComponent, TablaComponent, ColumnaTemplateDirective],
  templateUrl: './plan-tratamiento.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanTratamientoComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  public readonly authService = inject(AuthService);

  constructor(private readonly fb: FormBuilder) {}

  columnasMedicamentos: ColumnaTabla[] = [
    { campo: 'medicamentoCustom', cabecera: 'Medicamento / Insumo' },
    { campo: 'dosisCustom', cabecera: 'Dosis / Cantidad' },
    { campo: 'frecuenciaCustom', cabecera: 'Frecuencia' },
    { campo: 'viaCustom', cabecera: 'Vía de admin.' },
    { campo: 'duracionCustom', cabecera: 'Duración' },
    { campo: 'accionesCustom', cabecera: '', alineacion: 'center' }
  ];

  get farmacologicoArray(): FormArray {
    return this.formGroup.get('farmacologico') as FormArray;
  }

  get procedimientosIndicadosGroup(): FormGroup {
    return this.formGroup.get('procedimientosIndicados') as FormGroup;
  }

  get examenesGroup(): FormGroup {
    return this.formGroup.get('solicitudExamenes') as FormGroup;
  }

  get interconsultasGroup(): FormGroup {
    return this.formGroup.get('interconsultas') as FormGroup;
  }

  get indicacionesGroup(): FormGroup {
    return this.formGroup.get('indicacionesGenerales') as FormGroup;
  }

  agregarMedicamento() {
    this.farmacologicoArray.push(this.fb.group({
      medicamento: [''],
      dosis: [''],
      frecuencia: [''],
      via: ['Oral'],
      duracion: ['']
    }));
  }

  removerMedicamento(index: number) {
    this.farmacologicoArray.removeAt(index);
  }

  getFormGroup(index: number): FormGroup {
    return this.farmacologicoArray.at(index) as FormGroup;
  }
}
