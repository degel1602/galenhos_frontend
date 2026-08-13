import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { OrdenService, OrdenMedica } from '../../../servicios/orden.service';
import { EvolucionService } from '../../../servicios/evolucion.service';

@Component({
  selector: 'app-ordenes-medicas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ordenes-medicas.html',
  // No usamos OnPush porque cargamos datos de API asíncronamente
})
export class OrdenesMedicasComponent implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup; // The parent will pass the root form or a subset. We assume root form.

  private ordenService = inject(OrdenService);
  private evolucionService = inject(EvolucionService);
  private fb = inject(FormBuilder);

  public ordenesPrevias: OrdenMedica[] = [];
  public isLoading = false;
  public isSubmitting = false;

  ngOnInit() {
    this.cargarOrdenes();
  }

  async cargarOrdenes() {
    this.isLoading = true;
    const paciente = this.evolucionService.activePatient();
    
    if (paciente && paciente.idRegAtencion) {
      try {
        this.ordenesPrevias = await this.ordenService.listarPorCuenta(paciente.idRegAtencion);
      } catch (error) {
        console.error('Error al cargar órdenes:', error);
      }
    }
    
    this.isLoading = false;
  }

  async guardarOrden() {
    const paciente = this.evolucionService.activePatient();
    if (!paciente) return;

    // Extraer datos del formulario
    const detallesForm = this.prescripcionArray.value;
    const ordenData = this.ordenesGroup.value;
    
    if (!ordenData.detalle && detallesForm.length === 0) {
      alert('Debe ingresar detalles o prescripciones médicas');
      return;
    }

    this.isSubmitting = true;

    const request: OrdenMedica = {
      idCuentaAtencion: paciente.idRegAtencion,
      idMedico: 1, // Médico logueado (hardcodeado temporalmente)
      observaciones: `${ordenData.orden ? '[' + ordenData.orden + '] ' : ''}${ordenData.detalle || ''}`,
      detalles: detallesForm.map((d: any) => ({
        idProcedimiento: 1, // Fallback ya que UI permitía texto libre
        cantidad: d.cantidad || 1,
        indicaciones: d.indicaciones || d.medicamento // Juntamos medicamento con indicaciones por ahora
      }))
    };

    const success = await this.ordenService.crearOrden(request);
    this.isSubmitting = false;

    if (success) {
      alert('Orden médica creada exitosamente.');
      this.ordenesGroup.reset();
      this.prescripcionArray.clear();
      this.agregarPrescripcion();
      this.cargarOrdenes(); // Refrescar historial
    } else {
      alert('Hubo un error al crear la orden médica.');
    }
  }

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
