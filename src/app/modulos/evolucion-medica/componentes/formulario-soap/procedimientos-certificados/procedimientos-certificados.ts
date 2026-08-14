import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../../auth/aplicacion/auth.service';

@Component({
  selector: 'app-procedimientos-certificados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './procedimientos-certificados.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedimientosCertificadosComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  public readonly authService = inject(AuthService);

  constructor(private readonly fb: FormBuilder) {}

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
    this.procedimientosArray.push(this.fb.group({
      cie10cx: [''],
      descripcion: [''],
      complicaciones: ['']
    }));
  }

  removerProcedimiento(index: number) {
    this.procedimientosArray.removeAt(index);
  }

  getProcedimientoGroup(index: number): FormGroup {
    return this.procedimientosArray.at(index) as FormGroup;
  }
}
