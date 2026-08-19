import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import {
  type FormArray,
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';
import {
  type ColumnaTabla,
  TablaComponent,
} from '../../../../../compartido/componentes/tabla/tabla.component';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';
import { AuthService } from '../../../../auth/aplicacion/auth.service';

@Component({
  selector: 'app-procedimientos-certificados',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorMensajeComponent,
    TablaComponent,
    ColumnaTemplateDirective,
  ],
  templateUrl: './procedimientos-certificados.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcedimientosCertificadosComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  public readonly authService = inject(AuthService);

  private readonly fb = inject(FormBuilder);

  columnasProcedimientos: ColumnaTabla[] = [
    { campo: 'cie10cxCustom', cabecera: 'CIE-10 CX', alineacion: 'center' },
    { campo: 'descripcionCustom', cabecera: 'Descripción de Procedimiento' },
    { campo: 'complicacionesCustom', cabecera: 'Complicaciones' },
    { campo: 'accionesCustom', cabecera: '', alineacion: 'center' },
  ];

  get procedimientosArray(): FormArray {
    return this.formGroup.get('procedimientosRealizados') as FormArray;
  }

  get incapacidadGroup(): FormGroup {
    return this.formGroup.get('incapacidad') as FormGroup;
  }

  get certificadosGroup(): FormGroup {
    return this.formGroup.get('certificados') as FormGroup;
  }

  agregarProcedimiento() {
    this.procedimientosArray.push(
      this.fb.group({
        cie10cx: [''],
        descripcion: [''],
        complicaciones: [''],
      }),
    );
  }

  removerProcedimiento(index: number) {
    this.procedimientosArray.removeAt(index);
  }

  getProcedimientoGroup(index: number): FormGroup {
    return this.procedimientosArray.at(index) as FormGroup;
  }
}
