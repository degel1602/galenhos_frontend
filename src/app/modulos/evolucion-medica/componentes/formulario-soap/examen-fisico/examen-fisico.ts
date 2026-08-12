import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-examen-fisico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './examen-fisico.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamenFisicoComponent {
  @Input({ required: true }) formArray!: FormArray;

  getFormGroup(index: number): FormGroup {
    return this.formArray.at(index) as FormGroup;
  }
}
