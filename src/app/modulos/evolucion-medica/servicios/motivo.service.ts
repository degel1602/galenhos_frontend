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
  private api = inject(ApiClientService);

  async listarMotivos(idRegAtencion: number): Promise<MotivoAtencion[]> {
    try {
      const data = await this.api.request<MotivoAtencion[]>(`/api/v1/evoluciones/${idRegAtencion}/motivos`, { method: 'GET' });
      return data || [];
    } catch (error) {
      console.error('Error al listar motivos:', error);
      return [];
    }
  }

  async crearMotivo(idRegAtencion: number, motivo: Partial<MotivoAtencion>): Promise<boolean> {
    try {
      await this.api.request(`/api/v1/evoluciones/${idRegAtencion}/motivos`, {
        method: 'POST',
        body: JSON.stringify(motivo)
      });
      return true;
    } catch (error) {
      console.error('Error al crear motivo:', error);
      return false;
    }
  }
}
