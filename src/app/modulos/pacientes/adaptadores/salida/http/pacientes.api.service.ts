import { Injectable, inject } from '@angular/core';
import { ApiClientService, ApiRequestError } from '../../../../../compartido/api-client/api-client.service';
import { IReniecResultado, IPaciente, IListadoPacientes, RegistroPacientePayload } from '../../../../../compartido/tipos/api-tipos';

@Injectable({
  providedIn: 'root'
})
export class PacientesApiService {
  private apiClient = inject(ApiClientService);

  private static readonly RENIEC_TIMEOUT_MS = 30000;

  listar(params: string): Promise<IListadoPacientes> {
    return this.apiClient.request<IListadoPacientes>(`/api/v1/pacientes?${params}`);
  }

  buscar(params: string): Promise<IPaciente[]> {
    return this.apiClient.request<IPaciente[]>(`/api/v1/pacientes/buscar?${params}`);
  }

  // El servicio SOAP externo puede tardar o colgarse; un timeout duro
  // garantiza que la UI nunca se quede "Consultando…" para siempre.
  consultarReniec(nroDocumento: string): Promise<IReniecResultado> {
    const promesa = this.apiClient.request<IReniecResultado>(`/api/v1/reniec/${encodeURIComponent(nroDocumento)}?operacion=completo`);
    return Promise.race([
      promesa,
      new Promise<never>((_, reject) => setTimeout(
        () => reject(new ApiRequestError('RENIEC_TIMEOUT', 'RENIEC tardó demasiado en responder. Intente nuevamente o complete los datos manualmente.', 0)),
        PacientesApiService.RENIEC_TIMEOUT_MS
      ))
    ]);
  }

  porDocumento(nroDocumento: string, idTipoDocIdentidad: number | string): Promise<IPaciente> {
    return this.apiClient.request<IPaciente>(`/api/v1/pacientes/por-documento?nroDocumento=${encodeURIComponent(nroDocumento)}&idTipoDocIdentidad=${idTipoDocIdentidad}`);
  }

  registrar(payload: RegistroPacientePayload): Promise<IPaciente> {
    return this.apiClient.request<IPaciente>('/api/v1/pacientes', { method: 'POST', body: JSON.stringify(payload) });
  }

  eliminar(idPaciente: number | string): Promise<IPaciente> {
    return this.apiClient.request<IPaciente>(`/api/v1/pacientes/${idPaciente}`, { method: 'DELETE' });
  }

  obtener(idPaciente: number | string): Promise<IPaciente> {
    return this.apiClient.request<IPaciente>(`/api/v1/pacientes/${idPaciente}`);
  }
}