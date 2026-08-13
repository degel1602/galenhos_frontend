import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InterconsultaService, Interconsulta } from '../../../servicios/interconsulta.service';
import { EvolucionService } from '../../../servicios/evolucion.service';

@Component({
  selector: 'app-interconsultas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './interconsultas.html'
})
export class InterconsultasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private interconsultaService = inject(InterconsultaService);
  private evolucionService = inject(EvolucionService);

  public interconsultaForm!: FormGroup;
  public interconsultas: Interconsulta[] = [];
  public isLoading = false;
  public isSubmitting = false;

  ngOnInit() {
    this.interconsultaForm = this.fb.group({
      idEspecialidad: ['', Validators.required],
      idMedicoDestino: [''],
      motivo: ['', Validators.required]
    });

    this.cargarHistorial();
  }

  async cargarHistorial() {
    // Para simplificar, obtenemos las interconsultas de una especialidad X o de la atencion
    // Como el Backend provee listarPorServicio, usaremos un mock o listaremos para "General"
    this.isLoading = true;
    try {
      // Idealmente, backend deberia tener /atencion/:id/interconsultas
      // Como no lo tiene, simulamos u obtenemos por un servicio general
      const data = await this.interconsultaService.listarPorServicio('Cardiologia'); 
      this.interconsultas = data;
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  }

  async solicitar() {
    if (this.interconsultaForm.invalid) return;
    
    this.isSubmitting = true;
    
    const paciente = this.evolucionService.activePatient();
    const idAtencion = paciente ? paciente.idRegAtencion : 0; // fallback

    const formData = this.interconsultaForm.value;
    const request: Interconsulta = {
      idAtencionOrigen: idAtencion,
      idEspecialidad: Number(formData.idEspecialidad),
      idMedicoDestino: formData.idMedicoDestino ? Number(formData.idMedicoDestino) : 0,
      motivo: formData.motivo
    };

    const success = await this.interconsultaService.crear(request);
    
    this.isSubmitting = false;
    
    if (success) {
      alert('Interconsulta solicitada correctamente.');
      this.interconsultaForm.reset({ idEspecialidad: '', idMedicoDestino: '' });
      this.cargarHistorial();
    } else {
      alert('Error al solicitar interconsulta.');
    }
  }
}
