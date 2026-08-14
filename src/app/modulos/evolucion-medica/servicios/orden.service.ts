import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';

export interface DetalleOrden {
  idDetalleOrden?: number;
  idOrden?: number;
  idServicio: number;
  nombreServicio?: string;
  cantidad: number;
  indicaciones?: string; // Mantenemos temporalmente para UI si es necesario, aunque backend no lo guarde
}

export interface OrdenMedica {
  idOrden?: number;
  idRegAtencion: number;
  idMedico: number;
  fechaOrden?: string;
  estado?: string;
  observacion: string;
  detalles: DetalleOrden[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private readonly api = inject(ApiClientService);

  async listarPorCuenta(idCuentaAtencion: number): Promise<OrdenMedica[]> {
    try {
      const data = await this.api.request<OrdenMedica[]>(`/api/v1/ordenes/cuenta/${idCuentaAtencion}`, { method: 'GET' });
      return data || [];
    } catch (error) {
      console.error('Error al listar ordenes:', error);
      return [];
    }
  }

  async crearOrden(orden: OrdenMedica): Promise<boolean> {
    try {
      await this.api.request('/api/v1/ordenes', {
        method: 'POST',
        body: JSON.stringify(orden)
      });
      return true;
    } catch (error) {
      console.error('Error al crear orden:', error);
      return false;
    }
  }
}
