import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChildren,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { __decorate } from 'tslib';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';

let ExamenFisicoComponent = class ExamenFisicoComponent {
  formArray;
  textareas;
  sistemas = [
    { nombre: 'Estado general' },
    { nombre: 'Piel' },
    {
      nombre: 'Cabeza y cuello',
      sub: 'Cabeza, cuello, ojos, oídos, nariz, boca',
    },
    { nombre: 'Tórax y pulmones' },
    { nombre: 'Corazón' },
    { nombre: 'Abdomen' },
    { nombre: 'Genitourinario' },
    { nombre: 'Extremidades y osteomuscular' },
    { nombre: 'Neurológico y estado mental' },
  ];
  getFormGroup(index) {
    return this.formArray.at(index);
  }
  esNormal(index) {
    return this.getFormGroup(index).get('normal')?.value === true;
  }
  marcarNormal(index) {
    const grupo = this.getFormGroup(index);
    grupo.patchValue({ normal: true, hallazgo: '' });
  }
  marcarAnormal(index) {
    this.getFormGroup(index).patchValue({ normal: false });
    this.focusTextarea(index);
  }
  marcarTodoNormal() {
    this.formArray.controls.forEach((g) => {
      g.patchValue({ normal: true, hallazgo: '' });
    });
  }
  focusTextarea(index) {
    setTimeout(() => {
      const el = this.textareas?.get(index);
      el?.nativeElement.focus();
    });
  }
};
__decorate(
  [Input({ required: true })],
  ExamenFisicoComponent.prototype,
  'formArray',
  void 0,
);
__decorate(
  [ViewChildren('hallazgoInput')],
  ExamenFisicoComponent.prototype,
  'textareas',
  void 0,
);
ExamenFisicoComponent = __decorate(
  [
    Component({
      selector: 'app-examen-fisico',
      standalone: true,
      imports: [CommonModule, ReactiveFormsModule, ErrorMensajeComponent],
      templateUrl: './examen-fisico.html',
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  ExamenFisicoComponent,
);

export { ExamenFisicoComponent };
