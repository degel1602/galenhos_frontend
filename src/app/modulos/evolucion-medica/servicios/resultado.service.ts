import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';

export interface ResultadoInfo {
  idResultado: number;
  idPaciente: number;
  tipoExamen: string;
  nombreExamen: string;
  fechaResultado: string;
  valores: string;
  observaciones: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResultadoService {
  private api = inject(ApiClientService);

  async listarLaboratorio(idPaciente: number): Promise<ResultadoInfo[]> {
    try {
      const data = await this.api.request<ResultadoInfo[]>(`/api/v1/resultados/laboratorio/paciente/${idPaciente}`, { method: 'GET' });
      return data || [];
    } catch (error) {
      console.error('Error al listar resultados de laboratorio:', error);
      return [];
    }
  }

  async listarImagenes(idPaciente: number): Promise<ResultadoInfo[]> {
    try {
      const data = await this.api.request<ResultadoInfo[]>(`/api/v1/resultados/imagenes/paciente/${idPaciente}`, { method: 'GET' });
      return data || [];
    } catch (error) {
      console.error('Error al listar resultados de imágenes:', error);
      return [];
    }
  }
}
