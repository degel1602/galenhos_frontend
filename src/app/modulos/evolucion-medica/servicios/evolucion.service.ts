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
  cama: string;
  estado: string;
}

export interface PaginaResponse<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
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
  public readonly page = signal<number>(1);
  public readonly totalPages = signal<number>(1);
  public readonly totalItems = signal<number>(0);
  public readonly pageSize = signal<number>(10);

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
  public async cargarPacientes(resetPage = true) {
    if (resetPage) this.page.set(1);
    this.isLoading.set(true);
    try {
      const params = new URLSearchParams();
      let fini = this.fechaDesde();
      if (!fini) {
        const now = new Date();
        const mes = String(now.getMonth() + 1).padStart(2, '0');
        fini = `${now.getFullYear()}-${mes}-01`;
      }
      params.append('fini', fini);
      if (this.fechaHasta()) params.append('ffin', this.fechaHasta());
      params.append('page', this.page().toString());
      params.append('pageSize', this.pageSize().toString());
      const qs = params.toString();
      const url = '/api/v1/evoluciones/pacientes?' + qs;
      const data = await this.api.request<PaginaResponse<PacienteItem>>(
        url,
        { method: 'GET' }
      );
      if (data) {
        this.pacientes.set(data.items ?? data as unknown as PacienteItem[]);
        if (Array.isArray(data)) {
          this.totalPages.set(1);
          this.totalItems.set(data.length);
        } else {
          this.page.set(data.page ?? 1);
          this.totalPages.set(data.totalPages ?? 1);
          this.totalItems.set(data.totalItems ?? (data.items?.length ?? 0));
        }
      }
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  public irAPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPages() || pagina === this.page()) return;
    this.page.set(pagina);
    this.cargarPacientes(false);
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

  // Normaliza una edad "32 años, 8 meses, -4 días" a valores coherentes,
  // pidiendo prestado un mes/día cuando el SP devuelve valores negativos.
  public normalizarEdad(edad: string): string {
    if (!edad) return 'N/A';
    const match = edad.match(/(-?\d+)\s*años?[,\s]+(-?\d+)\s*meses?[,\s]+(-?\d+)\s*días?/i);
    if (!match) return edad;

    let anios = Number(match[1]);
    let meses = Number(match[2]);
    let dias = Number(match[3]);

    while (dias < 0) {
      meses -= 1;
      dias += 30;
    }
    while (meses < 0) {
      anios -= 1;
      meses += 12;
    }

    return `${anios} años, ${meses} meses, ${dias} días`;
  }

  public selectPatient(paciente: PacienteItem) {
    this.activePatient.set(paciente);
  }

  public clearSelection() {
    this.activePatient.set(null);
    this.setViewMode('tray');
    this.cargarPacientes(); // Reload on back
  }
}

