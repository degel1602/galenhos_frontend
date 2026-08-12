import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ordenes-medicas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ordenes-medicas.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdenesMedicasComponent {
  @Input({ required: true }) formGroup!: FormGroup; // The parent will pass the root form or a subset. We assume root form.

  constructor(private fb: FormBuilder) {}

  get ordenesGroup(): FormGroup {
    return this.formGroup.get('ordenesMedicas') as FormGroup;
  }

  get prescripcionArray(): FormArray {
    return this.formGroup.get('prescripcion') as FormArray;
  }

  agregarPrescripcion() {
    this.prescripcionArray.push(this.fb.group({
      medicamento: [''],
      cantidad: [null],
      indicaciones: ['']
    }));
  }

  removerPrescripcion(index: number) {
    this.prescripcionArray.removeAt(index);
  }

  getPrescripcionGroup(index: number): FormGroup {
    return this.prescripcionArray.at(index) as FormGroup;
  }
}
