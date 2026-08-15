import { Component, Input, ChangeDetectionStrategy, ViewChildren, QueryList, ElementRef } from '@angular/core';
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

  @ViewChildren('hallazgoInput') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  sistemas: { nombre: string; sub?: string }[] = [
    { nombre: 'Estado general' },
    { nombre: 'Piel' },
    { nombre: 'Cabeza y cuello', sub: 'Cabeza, cuello, ojos, oídos, nariz, boca' },
    { nombre: 'Tórax y pulmones' },
    { nombre: 'Corazón' },
    { nombre: 'Abdomen' },
    { nombre: 'Genitourinario' },
    { nombre: 'Extremidades y osteomuscular' },
    { nombre: 'Neurológico y estado mental' }
  ];

  getFormGroup(index: number): FormGroup {
    return this.formArray.at(index) as FormGroup;
  }

  esNormal(index: number): boolean {
    return this.getFormGroup(index).get('normal')?.value === true;
  }

  marcarNormal(index: number): void {
    const grupo = this.getFormGroup(index);
    grupo.patchValue({ normal: true, hallazgo: '' });
  }

  marcarAnormal(index: number): void {
    this.getFormGroup(index).patchValue({ normal: false });
    this.focusTextarea(index);
  }

  marcarTodoNormal(): void {
    this.formArray.controls.forEach(g => g.patchValue({ normal: true, hallazgo: '' }));
  }

  private focusTextarea(index: number): void {
    setTimeout(() => {
      const el = this.textareas?.get(index);
      el?.nativeElement.focus();
    });
  }
}
