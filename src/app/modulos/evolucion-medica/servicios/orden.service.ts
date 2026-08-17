import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';

export interface DetalleOrden {
  idProducto: number;
  nombreProducto?: string;
  cantidad: number;
  indicaciones?: string;
}

export interface OrdenMedica {
  idOrden?: number;
  idRegAtencion: number;
  idMedico?: number;
  medico?: string;
  fechaOrden?: string;
  estado?: string;
  observacion: string;
  detalles: DetalleOrden[];
}

export interface ProductoCatalogo {
  idProducto: number;
  codigo: string;
  nombre: string;
  concentracion: string;
  presentacion: string;
  formaFarmaceutica: string;
  precioVenta: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private readonly api = inject(ApiClientService);

  async listarPorCuenta(idRegAtencion: number): Promise<OrdenMedica[]> {
    try {
      const data = await this.api.request<OrdenMedica[]>(`/api/v1/ordenes/cuenta/${idRegAtencion}`, { method: 'GET' });
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

  async buscarProductos(filtro: string, limite = 20): Promise<ProductoCatalogo[]> {
    try {
      const q = encodeURIComponent(filtro);
      const data = await this.api.request<ProductoCatalogo[]>(`/api/v1/ordenes/productos?q=${q}&limite=${limite}`, { method: 'GET' });
      return data || [];
    } catch (error) {
      console.error('Error al buscar productos:', error);
      return [];
    }
  }
}