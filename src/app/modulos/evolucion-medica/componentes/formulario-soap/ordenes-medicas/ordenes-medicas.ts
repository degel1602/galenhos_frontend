import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { OrdenService, OrdenMedica } from '../../../servicios/orden.service';
import { EvolucionService } from '../../../servicios/evolucion.service';
import { AuthService } from '../../../../auth/aplicacion/auth.service';

@Component({
  selector: 'app-ordenes-medicas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ordenes-medicas.html',
  // No usamos OnPush porque cargamos datos de API asíncronamente
})
export class OrdenesMedicasComponent implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup; // The parent will pass the root form or a subset. We assume root form.

  private readonly ordenService = inject(OrdenService);
  private readonly evolucionService = inject(EvolucionService);
  private readonly fb = inject(FormBuilder);
  public readonly authService = inject(AuthService);

  public readonly ordenesPrevias = signal<OrdenMedica[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly isSubmitting = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');
  public readonly successMessage = signal<string>('');

  ngOnInit() {
    this.cargarOrdenes();
  }

  async cargarOrdenes() {
    const paciente = this.evolucionService.activePatient();
    if (!paciente?.idRegAtencion) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const datos = await this.ordenService.listarPorCuenta(paciente.idRegAtencion);
      this.ordenesPrevias.set(datos);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      this.errorMessage.set('No se pudieron cargar las órdenes previas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async guardarOrden() {
    const paciente = this.evolucionService.activePatient();
    if (!paciente) return;

    this.errorMessage.set('');
    this.successMessage.set('');

    // Extraer datos del formulario
    const detallesForm = this.prescripcionArray.value;
    const ordenData = this.ordenesGroup.value;
    
    if (!ordenData.detalle && detallesForm.length === 0) {
      this.errorMessage.set('Debe ingresar detalles de la orden o añadir prescripciones médicas.');
      return;
    }

    this.isSubmitting.set(true);

    const request: OrdenMedica = {
      idRegAtencion: paciente.idRegAtencion,
      idMedico: 1, // Médico logueado (hardcodeado temporalmente)
      observacion: `${ordenData.orden ? '[' + ordenData.orden + '] ' : ''}${ordenData.detalle || ''}`,
      detalles: detallesForm.map((d: any) => ({
        idServicio: 1, // Fallback ya que UI permitía texto libre
        cantidad: d.cantidad || 1,
        indicaciones: d.indicaciones || d.medicamento // Juntamos medicamento con indicaciones por ahora
      }))
    };

    const success = await this.ordenService.crearOrden(request);
    this.isSubmitting.set(false);

    if (success) {
      this.successMessage.set('Orden médica creada exitosamente.');
      this.ordenesGroup.reset();
      this.prescripcionArray.clear();
      this.agregarPrescripcion();
      await this.cargarOrdenes(); // Refrescar historial
      
      // Limpiar mensaje de éxito después de 4 segundos
      setTimeout(() => this.successMessage.set(''), 4000);
    } else {
      this.errorMessage.set('Hubo un error al crear la orden médica. Inténtalo nuevamente.');
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

