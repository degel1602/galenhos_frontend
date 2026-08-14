import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';

export interface ResultadoInfo {
  idResultado: number;
  idPaciente: number;
  tipoResultado: string;
  nombreExamen: string;
  fechaResultado: string;
  valores: string;
  observaciones: string;
  estado: string;
}

interface ResultadoBackend {
  idResultado: number;
  idPaciente: number;
  tipoResultado: string;
  nombreExamen: string;
  fechaExamen?: string;
  fechaResultado?: string;
  detalle?: string;
  valores?: string;
  observaciones?: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResultadoService {
  private readonly api = inject(ApiClientService);

  async listarLaboratorio(idPaciente: number): Promise<ResultadoInfo[]> {
    try {
      const datos = await this.api.request<ResultadoBackend[]>(
        `/api/v1/resultados/laboratorio/paciente/${idPaciente}`,
        { method: 'GET' }
      );
      return (datos ?? []).map(this.normalizarResultado);
    } catch (error) {
      console.error('Error al listar resultados de laboratorio:', error);
      return [];
    }
  }

  async listarImagenes(idPaciente: number): Promise<ResultadoInfo[]> {
    try {
      const datos = await this.api.request<ResultadoBackend[]>(
        `/api/v1/resultados/imagenes/paciente/${idPaciente}`,
        { method: 'GET' }
      );
      return (datos ?? []).map(this.normalizarResultado);
    } catch (error) {
      console.error('Error al listar resultados de imágenes:', error);
      return [];
    }
  }

  private normalizarResultado(item: ResultadoBackend): ResultadoInfo {
    return {
      idResultado: item.idResultado,
      idPaciente: item.idPaciente,
      tipoResultado: item.tipoResultado ?? '',
      nombreExamen: item.nombreExamen ?? '',
      fechaResultado: item.fechaExamen ?? item.fechaResultado ?? '',
      valores: item.detalle ?? item.valores ?? '',
      observaciones: item.observaciones ?? '',
      estado: item.estado ?? 'Pendiente'
    };
  }
}

