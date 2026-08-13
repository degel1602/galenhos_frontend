import { Component, Input, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { ResultadoService, ResultadoInfo } from '../../../servicios/resultado.service';
import { EvolucionService } from '../../../servicios/evolucion.service';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resultados.html',
  // No usamos OnPush aquí porque actualizamos datos asíncronamente
})
export class ResultadosComponent implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup;
  private resultadoService = inject(ResultadoService);
  private evolucionService = inject(EvolucionService);

  public laboratorios: ResultadoInfo[] = [];
  public imagenes: ResultadoInfo[] = [];
  public isLoading = false;

  get laboratorioArray(): FormArray {
    return this.formGroup.get('laboratorio') as FormArray;
  }

  get imagenesArray(): FormArray {
    return this.formGroup.get('imagenes') as FormArray;
  }

  get otrosArray(): FormArray {
    return this.formGroup.get('otros') as FormArray;
  }

  ngOnInit() {
    this.cargarResultados();
  }

  async cargarResultados() {
    this.isLoading = true;
    const paciente = this.evolucionService.activePatient();
    
    // Si no hay paciente seleccionado (ej. modo offline mockup), cargamos un array vacío
    if (paciente && paciente.idPaciente) {
      try {
        const [labs, imgs] = await Promise.all([
          this.resultadoService.listarLaboratorio(paciente.idPaciente),
          this.resultadoService.listarImagenes(paciente.idPaciente)
        ]);
        this.laboratorios = labs;
        this.imagenes = imgs;
      } catch (error) {
        console.error('Error al cargar resultados desde el backend:', error);
      }
    }
    
    this.isLoading = false;
  }

  // Backup array for others (not yet in API)
  otrosEstaticos = [
    { nombre: 'ECG', fecha: '26/07/2026', resultado: 'Ritmo sinusal' },
    { nombre: 'Anatomía patológica', fecha: '—', resultado: 'No solicitado' },
    { nombre: 'Endoscopía', fecha: '—', resultado: 'No solicitado' }
  ];
}
