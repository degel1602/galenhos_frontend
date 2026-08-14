import { Injectable, inject } from '@angular/core';
import { ApiClientService, ApiRequestError } from '../../../../../compartido/api-client/api-client.service';
import { IReniecResultado, IFilaBackend } from '../../../../../compartido/tipos/api-tipos';

// RegistroTriajePayload modela el cuerpo de POST /api/v1/triaje.
// Todos los campos son opcionales en el backend (punteros); se envían solo
// los que el formulario recopila.
export interface RegistroTriajePayload {
  idTriaje?: number;
  idDocIdentidad?: number;
  nroDocumento?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  primerNombre?: string;
  segundoNombre?: string;
  tercerNombre?: string;
  idSexo?: number;
  fechaNacimiento?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  idEstadoCivil?: number;
  idDepartamentoDomicilio?: number;
  idProvinciaDomicilio?: number;
  idDistritoDomicilio?: number;
  idComunidadDomicilio?: number;
  idEsAccidenteTransito?: number;
  idFuenteFinanciamiento?: number;
  idEstadollego?: number;
  gestante?: number;
  motivo?: string;
  presionArterial?: string;
  frecCardiaca?: number;
  frecRespiratoria?: number;
  temperatura?: number;
  saturacion?: number;
  fiO2?: number;
  peso?: number;
  talla?: number;
  imc?: number;
  escalaDolor?: number;
  escalaGlasgow?: number;
  tiempoEvolucionCantidad?: number;
  tiempoEvolucionCantidadUnidad?: string;
  idServicio?: number;
  idTipoPrioridad?: number;
}

export interface PendientesAdmisionParams {
  fecha: string;
  filtro?: string;
  nroCta?: number;
  idDepartamento?: number;
  idEspecialidad?: number;
  idServicio?: number;
  idTipoServicio?: number;
}

export interface CrearAdmisionPayload {
  idTriaje: number;
  idPacienteTriaje: number;
  nombreAcompanante?: string;
  telefonoAcompanante?: string;
  direccionPaciente?: string;
  observacion?: string;
}

export interface RespuestaSp {
  resultado: string;
}

export interface ReporteTriajeParams {
  id?: number;
  idPaciente?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TriajeApiService {
  private apiClient = inject(ApiClientService);

  private static readonly RENIEC_TIMEOUT_MS = 30000;

  // El servicio SOAP externo puede tardar o colgarse; un timeout duro
  // garantiza que la UI nunca se quede "Consultando…" para siempre.
  consultarReniec(nroDocumento: string): Promise<IReniecResultado> {
    const promesa = this.apiClient.request<IReniecResultado>(`/api/v1/reniec/${encodeURIComponent(nroDocumento)}?operacion=completo`);
    return Promise.race([
      promesa,
      new Promise<never>((_, reject) => setTimeout(
        () => reject(new ApiRequestError('RENIEC_TIMEOUT', 'RENIEC tardó demasiado en responder. Intente nuevamente o complete los datos manualmente.', 0)),
        TriajeApiService.RENIEC_TIMEOUT_MS
      ))
    ]);
  }

  registrar(payload: RegistroTriajePayload): Promise<RespuestaSp> {
    return this.apiClient.request<RespuestaSp>('/api/v1/triaje', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  listar(fini: string, ffin: string, filtro = ''): Promise<IFilaBackend[]> {
    const query = new URLSearchParams({ fini, ffin });
    if (filtro) query.append('filtro', filtro);
    return this.apiClient.request<IFilaBackend[]>(`/api/v1/triaje?${query.toString()}`);
  }

  listarPendientesAdmision(params: PendientesAdmisionParams): Promise<IFilaBackend[]> {
    const query = new URLSearchParams();
    query.append('fecha', params.fecha);
    if (params.filtro) query.append('filtro', params.filtro);
    if (params.nroCta) query.append('nroCta', String(params.nroCta));
    if (params.idDepartamento) query.append('idDepartamento', String(params.idDepartamento));
    if (params.idEspecialidad) query.append('idEspecialidad', String(params.idEspecialidad));
    if (params.idServicio) query.append('idServicio', String(params.idServicio));
    if (params.idTipoServicio) query.append('idTipoServicio', String(params.idTipoServicio));
    return this.apiClient.request<IFilaBackend[]>(`/api/v1/triaje/pendientes-admision?${query.toString()}`);
  }

  crearAdmision(payload: CrearAdmisionPayload): Promise<RespuestaSp> {
    return this.apiClient.request<RespuestaSp>('/api/v1/triaje/admision', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  obtenerReporte(params: ReporteTriajeParams): Promise<IFilaBackend[]> {
    const query = new URLSearchParams();
    if (params.id) query.append('id', String(params.id));
    if (params.idPaciente) query.append('idPaciente', String(params.idPaciente));
    return this.apiClient.request<IFilaBackend[]>(`/api/v1/triaje/reporte?${query.toString()}`);
  }

  obtenerFichaAdmision(idCuentaAtencion: number): Promise<IFilaBackend> {
    return this.apiClient.request<IFilaBackend>(`/api/v1/triaje/ficha-admision?idCuentaAtencion=${idCuentaAtencion}`);
  }
}