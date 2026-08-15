import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InterconsultaService, Interconsulta, EspecialidadInterconsulta, MedicoInterconsulta } from '../../../servicios/interconsulta.service';
import { EvolucionService } from '../../../servicios/evolucion.service';
import { AuthService } from '../../../../auth/aplicacion/auth.service';

@Component({
  selector: 'app-interconsultas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './interconsultas.html'
})
export class InterconsultasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly interconsultaService = inject(InterconsultaService);
  private readonly evolucionService = inject(EvolucionService);
  public readonly authService = inject(AuthService);

  public readonly interconsultaForm: FormGroup = this.fb.group({
    idEspecialidad: ['', Validators.required],
    idMedicoDestino: [''],
    motivo: ['', [Validators.required, Validators.minLength(10)]]
  });

  public readonly interconsultas = signal<Interconsulta[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly isSubmitting = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');

  public readonly especialidades = signal<EspecialidadInterconsulta[]>([]);
  public readonly medicos = signal<MedicoInterconsulta[]>([]);
  public readonly medicosCargando = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarHistorial();
    this.cargarEspecialidades();
  }

  async cargarEspecialidades(): Promise<void> {
    const lista = await this.interconsultaService.listarEspecialidades();
    this.especialidades.set(lista);
  }

  async cambiarEspecialidad(idEspecialidad: number): Promise<void> {
    this.interconsultaForm.patchValue({ idMedicoDestino: '' });
    this.medicos.set([]);

    if (!idEspecialidad) return;

    this.medicosCargando.set(true);
    const lista = await this.interconsultaService.listarMedicosPorEspecialidad(idEspecialidad);
    this.medicos.set(lista);
    this.medicosCargando.set(false);
  }

  onEspecialidadChange(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.cambiarEspecialidad(valor ? Number(valor) : 0);
  }

  async cargarHistorial(): Promise<void> {
    const paciente = this.evolucionService.activePatient();
    if (!paciente?.idRegAtencion) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const datos = await this.interconsultaService.listarPorAtencion(paciente.idRegAtencion);
      this.interconsultas.set(datos);
    } catch {
      this.errorMessage.set('No se pudieron cargar las interconsultas previas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async solicitar(): Promise<void> {
    if (this.interconsultaForm.invalid) return;

    const paciente = this.evolucionService.activePatient();
    const idAtencion = paciente?.idRegAtencion ?? 0;

    this.isSubmitting.set(true);

    const formData = this.interconsultaForm.value as { idEspecialidad: string; idMedicoDestino: string; motivo: string };
    const request: Interconsulta = {
      idAtencionOrigen: idAtencion,
      idEspecialidad: Number(formData.idEspecialidad),
      idMedicoDestino: formData.idMedicoDestino ? Number(formData.idMedicoDestino) : 0,
      motivo: formData.motivo
    };

    const exito = await this.interconsultaService.crear(request);
    this.isSubmitting.set(false);

    if (exito) {
      this.interconsultaForm.reset({ idEspecialidad: '', idMedicoDestino: '', motivo: '' });
      this.medicos.set([]);
      await this.cargarHistorial();
    } else {
      this.errorMessage.set('Error al solicitar la interconsulta. Inténtalo de nuevo.');
    }
  }

  async atender(idInterconsulta: number): Promise<void> {
    const exito = await this.interconsultaService.actualizarEstado(idInterconsulta, 'En Progreso');
    if (exito) {
      await this.cargarHistorial();
    }
  }

  obtenerNombreEspecialidad(idEspecialidad: number): string {
    const especialidad = this.especialidades().find(e => e.idEspecialidad === idEspecialidad);
    return especialidad?.nombre ?? `Esp. #${idEspecialidad}`;
  }
}

