import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../../../compartido/api-client/api-client.service';

@Injectable({
  providedIn: 'root'
})
export class PacientesApiService {
  private apiClient = inject(ApiClientService);

  buscar(params: string): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/pacientes/buscar?${params}`);
  }

  consultarReniec(nroDocumento: string): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/reniec/${encodeURIComponent(nroDocumento)}?operacion=completo`);
  }

  porDocumento(nroDocumento: string, idTipoDocIdentidad: number | string): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/pacientes/por-documento?nroDocumento=${encodeURIComponent(nroDocumento)}&idTipoDocIdentidad=${idTipoDocIdentidad}`);
  }

  registrar(payload: any): Promise<any> {
    return this.apiClient.request<any>('/api/v1/pacientes', { method: 'POST', body: JSON.stringify(payload) });
  }

  eliminar(idPaciente: number | string): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/pacientes/${idPaciente}`, { method: 'DELETE' });
  }

  obtener(idPaciente: number | string): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/pacientes/${idPaciente}`);
  }
}
