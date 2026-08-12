import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resultados.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultadosComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  get laboratorioArray(): FormArray {
    return this.formGroup.get('laboratorio') as FormArray;
  }

  get imagenesArray(): FormArray {
    return this.formGroup.get('imagenes') as FormArray;
  }

  get otrosArray(): FormArray {
    return this.formGroup.get('otros') as FormArray;
  }

  // En un caso real estos vendrían de la API, aquí proveemos una lista mock 
  // para que se rendericen visualmente tal como en la maqueta
  laboratoriosEstaticos = [
    { nombre: 'Hemograma', fecha: '26/07/2026', resultado: 'Leucocitos 9.8, Hb 13.2' },
    { nombre: 'Bioquímica', fecha: '26/07/2026', resultado: 'Glucosa 92, Creatinina 0.9' },
    { nombre: 'Cultivos', fecha: '25/07/2026', resultado: 'Pendiente' },
    { nombre: 'Gases arteriales', fecha: '—', resultado: 'No solicitado' }
  ];

  imagenesEstaticas = [
    { nombre: 'Rayos X', fecha: '24/07/2026', resultado: 'Sin hallazgos agudos' },
    { nombre: 'Ecografía', fecha: '—', resultado: 'No solicitado' },
    { nombre: 'Tomografía', fecha: '—', resultado: 'No solicitado' },
    { nombre: 'Resonancia', fecha: '—', resultado: 'No solicitado' }
  ];

  otrosEstaticos = [
    { nombre: 'ECG', fecha: '26/07/2026', resultado: 'Ritmo sinusal' },
    { nombre: 'Anatomía patológica', fecha: '—', resultado: 'No solicitado' },
    { nombre: 'Endoscopía', fecha: '—', resultado: 'No solicitado' }
  ];
}
