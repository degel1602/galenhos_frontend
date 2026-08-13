import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../api-client/api-client.service';
import {
  ICatalogoDescripcion,
  ICatalogoNombre,
  IFuenteFinanciamiento,
  IReniecResultado,
  IFilaBackend
} from '../tipos/api-tipos';

@Injectable({
  providedIn: 'root'
})
export class MaestrosApiService {
  private readonly apiClient = inject(ApiClientService);

  getTiposDocumentos(): Promise<ICatalogoDescripcion[]> { return this.apiClient.request<ICatalogoDescripcion[]>('/api/v1/tipos-documentos'); }
  getIdiomas(): Promise<ICatalogoDescripcion[]> { return this.apiClient.request<ICatalogoDescripcion[]>('/api/v1/idiomas'); }
  getEtnias(): Promise<ICatalogoDescripcion[]> { return this.apiClient.request<ICatalogoDescripcion[]>('/api/v1/etnias'); }
  getDepartamentos(): Promise<ICatalogoNombre[]> { return this.apiClient.request<ICatalogoNombre[]>('/api/v1/departamentos'); }
  getPaises(): Promise<ICatalogoNombre[]> { return this.apiClient.request<ICatalogoNombre[]>('/api/v1/paises'); }
  getTiposSexo(): Promise<ICatalogoDescripcion[]> { return this.apiClient.request<ICatalogoDescripcion[]>('/api/v1/tipos-sexo'); }
  getEstadosCivil(): Promise<ICatalogoDescripcion[]> { return this.apiClient.request<ICatalogoDescripcion[]>('/api/v1/estados-civil'); }
  getEstadosLlegoPaciente(): Promise<ICatalogoDescripcion[]> { return this.apiClient.request<ICatalogoDescripcion[]>('/api/v1/estados-llego-paciente'); }
  getFuentesFinanciamiento(): Promise<IFuenteFinanciamiento[]> { return this.apiClient.request<IFuenteFinanciamiento[]>('/api/v1/fuentes-financiamiento'); }
  getGradosInstruccion(): Promise<ICatalogoDescripcion[]> { return this.apiClient.request<ICatalogoDescripcion[]>('/api/v1/grados-instruccion'); }
  getOcupaciones(): Promise<ICatalogoDescripcion[]> { return this.apiClient.request<ICatalogoDescripcion[]>('/api/v1/ocupaciones'); }
  getProvincias(idDepartamento: number | string): Promise<ICatalogoNombre[]> { return this.apiClient.request<ICatalogoNombre[]>(`/api/v1/provincias/${idDepartamento}`); }
  getDistritos(idProvincia: number | string): Promise<ICatalogoNombre[]> { return this.apiClient.request<ICatalogoNombre[]>(`/api/v1/distritos/${idProvincia}`); }
  getCentrosPoblados(idDistrito: number | string): Promise<ICatalogoNombre[]> { return this.apiClient.request<ICatalogoNombre[]>(`/api/v1/centros-poblados/${idDistrito}`); }
  getEspecialidades(): Promise<ICatalogoNombre[]> { return this.apiClient.request<ICatalogoNombre[]>('/api/v1/especialidades'); }
  getServicios(idArea: number | string): Promise<ICatalogoNombre[]> { return this.apiClient.request<ICatalogoNombre[]>(`/api/v1/servicios/${idArea}`); }
  getDatosInstitucion(): Promise<IFilaBackend> { return this.apiClient.request<IFilaBackend>('/api/v1/datos-institucion'); }

  // RENIEC puede devolver el objeto de datos con campos ausentes.
  consultarReniec(nroDocumento: string): Promise<IReniecResultado> {
    return this.apiClient.request<IReniecResultado>(`/api/v1/reniec/${encodeURIComponent(nroDocumento)}?operacion=completo`);
  }
}