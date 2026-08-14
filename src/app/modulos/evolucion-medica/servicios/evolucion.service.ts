import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';

export type ViewMode = 'tray' | 'form';

export interface PacienteItem {
  idRegAtencion: number;
  idPaciente: number;
  historia: string;
  nombre: string;
  edad: string;
  sexo: string;
  ubicacion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvolucionService {
  private readonly api = inject(ApiClientService);

  // Estado base con Signals
  public readonly viewMode = signal<ViewMode>('tray');
  public readonly patientSearch = signal<string>('');
  public readonly fechaDesde = signal<string>('');
  public readonly fechaHasta = signal<string>('');
  
  // Datos reales para la bandeja
  public readonly pacientes = signal<PacienteItem[]>([]);
  public readonly isLoading = signal<boolean>(false);

  public readonly activePatient = signal<PacienteItem | null>(null);

  // Derivados (Computed)
  public readonly filteredPacientes = computed(() => {
    const term = this.patientSearch().toLowerCase();
    if (!term) return this.pacientes();
    return this.pacientes().filter(p => 
      p.nombre.toLowerCase().includes(term) || p.historia.toLowerCase().includes(term)
    );
  });

  // Acciones
  public async cargarPacientes() {
    this.isLoading.set(true);
    try {
      const params = new URLSearchParams();
      if (this.fechaDesde()) params.append('fini', this.fechaDesde());
      if (this.fechaHasta()) params.append('ffin', this.fechaHasta());
      const qs = params.toString();
      const url = qs ? '/api/v1/evoluciones/pacientes?' + qs : '/api/v1/evoluciones/pacientes';
      const data = await this.api.request<PacienteItem[]>(
        url,
        { method: 'GET' }
      );
      if (data) {
        this.pacientes.set(data);
      }
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async guardarEvolucion(dataB64: string): Promise<boolean> {
    const paciente = this.activePatient();
    if (!paciente) return false;

    try {
      await this.api.request('/api/v1/evoluciones', {
        method: 'POST',
        body: JSON.stringify({
          idRegAtencion: paciente.idRegAtencion,
          dataB64: dataB64
        })
      });
      return true;
    } catch (error) {
      console.error('Error guardando evolución:', error);
      return false;
    }
  }

  public setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  public selectPatient(paciente: PacienteItem) {
    this.activePatient.set(paciente);
    this.setViewMode('form');
  }

  public clearSelection() {
    this.activePatient.set(null);
    this.setViewMode('tray');
    this.cargarPacientes(); // Reload on back
  }
}

