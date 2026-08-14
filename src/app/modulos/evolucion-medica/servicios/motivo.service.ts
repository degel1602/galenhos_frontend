import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';

export interface MotivoAtencion {
  idMotivoAtencion?: number;
  idRegAtencion: number;
  descripcion: string;
  tipo: string;
  fechaRegistro?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MotivoService {
  private readonly api = inject(ApiClientService);

  async listarMotivos(idRegAtencion: number): Promise<MotivoAtencion[]> {
    try {
      const datos = await this.api.request<{ motivo: string; fechaRegistro?: string }[]>(
        `/api/v1/evoluciones/${idRegAtencion}/motivos`,
        { method: 'GET' }
      );
      if (!datos) return [];
      return datos.map((item, index) => this.parsearMotivo(item, idRegAtencion, index));
    } catch (error) {
      console.error('Error al listar motivos:', error);
      return [];
    }
  }

  async crearMotivo(idRegAtencion: number, motivo: Partial<MotivoAtencion>): Promise<boolean> {
    try {
      const textoMotivo = `[${motivo.tipo}] ${motivo.descripcion}`;
      await this.api.request(`/api/v1/evoluciones/${idRegAtencion}/motivos`, {
        method: 'POST',
        body: JSON.stringify({ motivo: textoMotivo })
      });
      return true;
    } catch (error) {
      console.error('Error al crear motivo:', error);
      return false;
    }
  }

  private parsearMotivo(
    item: { motivo: string; fechaRegistro?: string },
    idRegAtencion: number,
    index: number
  ): MotivoAtencion {
    const coincidencia = item.motivo.match(/^\[(.+?)\]\s*(.*)$/s);
    return {
      idMotivoAtencion: index + 1,
      idRegAtencion,
      tipo: coincidencia ? coincidencia[1] : 'Consulta',
      descripcion: coincidencia ? coincidencia[2].trim() : item.motivo,
      fechaRegistro: item.fechaRegistro
    };
  }
}
