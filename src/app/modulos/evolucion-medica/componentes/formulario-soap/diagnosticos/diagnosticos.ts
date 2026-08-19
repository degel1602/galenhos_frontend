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
  type FormControl,
  type FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../auth/aplicacion/auth.service';

export interface DxForm {
  cie10: FormControl<string | null>;
  descripcion: FormControl<string | null>;
  tipo: FormControl<string | null>;
  condicion: FormControl<string | null>;
  estado: FormControl<string | null>;
}

import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';
import {
  type ColumnaTabla,
  TablaComponent,
} from '../../../../../compartido/componentes/tabla/tabla.component';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';

@Component({
  selector: 'app-diagnosticos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorMensajeComponent,
    TablaComponent,
    ColumnaTemplateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './diagnosticos.html',
})
export class DiagnosticosComponent {
  @Input({ required: true }) formArray!: FormArray<FormGroup<DxForm>>;
  private readonly fb = inject(FormBuilder);
  public readonly authService = inject(AuthService);

  columnasDiagnosticos: ColumnaTabla[] = [
    { campo: 'cie10Custom', cabecera: 'CIE-10', ancho: '100px' },
    { campo: 'descripcionCustom', cabecera: 'Descripción' },
    { campo: 'tipoCustom', cabecera: 'Tipo' },
    { campo: 'condicionCustom', cabecera: 'Condición' },
    { campo: 'estadoCustom', cabecera: 'Estado' },
    {
      campo: 'accionesCustom',
      cabecera: '',
      alineacion: 'center',
      ancho: '40px',
    },
  ];

  agregarDx() {
    this.formArray.push(
      this.fb.group({
        cie10: [''],
        descripcion: [''],
        tipo: ['Presuntivo'],
        condicion: ['Secundario'],
        estado: ['Activo'],
      }) as FormGroup<DxForm>,
    );
  }

  removerDx(index: number) {
    this.formArray.removeAt(index);
  }
}
