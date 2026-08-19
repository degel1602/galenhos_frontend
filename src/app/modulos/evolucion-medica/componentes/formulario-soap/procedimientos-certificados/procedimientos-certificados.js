import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { __decorate } from 'tslib';
import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';
import { TablaComponent } from '../../../../../compartido/componentes/tabla/tabla.component';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';
import { AuthService } from '../../../../auth/aplicacion/auth.service';

let ProcedimientosCertificadosComponent = class ProcedimientosCertificadosComponent {
  formGroup;
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  columnasProcedimientos = [
    { campo: 'cie10cxCustom', cabecera: 'CIE-10 CX', alineacion: 'center' },
    { campo: 'descripcionCustom', cabecera: 'Descripción de Procedimiento' },
    { campo: 'complicacionesCustom', cabecera: 'Complicaciones' },
    { campo: 'accionesCustom', cabecera: '', alineacion: 'center' },
  ];
  get procedimientosArray() {
    return this.formGroup.get('procedimientosRealizados');
  }
  get incapacidadGroup() {
    return this.formGroup.get('incapacidad');
  }
  get certificadosGroup() {
    return this.formGroup.get('certificados');
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
  removerProcedimiento(index) {
    this.procedimientosArray.removeAt(index);
  }
  getProcedimientoGroup(index) {
    return this.procedimientosArray.at(index);
  }
};
__decorate(
  [Input({ required: true })],
  ProcedimientosCertificadosComponent.prototype,
  'formGroup',
  void 0,
);
ProcedimientosCertificadosComponent = __decorate(
  [
    Component({
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
    }),
  ],
  ProcedimientosCertificadosComponent,
);

export { ProcedimientosCertificadosComponent };
