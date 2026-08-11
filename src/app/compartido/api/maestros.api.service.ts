import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../api-client/api-client.service';

@Injectable({
  providedIn: 'root'
})
export class MaestrosApiService {
  private readonly apiClient = inject(ApiClientService);

  getTiposDocumentos(): Promise<any> { return this.apiClient.request<any>('/api/v1/tipos-documentos'); }
  getIdiomas(): Promise<any> { return this.apiClient.request<any>('/api/v1/idiomas'); }
  getEtnias(): Promise<any> { return this.apiClient.request<any>('/api/v1/etnias'); }
  getDepartamentos(): Promise<any> { return this.apiClient.request<any>('/api/v1/departamentos'); }
  getPaises(): Promise<any> { return this.apiClient.request<any>('/api/v1/paises'); }
  getTiposSexo(): Promise<any> { return this.apiClient.request<any>('/api/v1/tipos-sexo'); }
  getEstadosCivil(): Promise<any> { return this.apiClient.request<any>('/api/v1/estados-civil'); }
  getGradosInstruccion(): Promise<any> { return this.apiClient.request<any>('/api/v1/grados-instruccion'); }
  getOcupaciones(): Promise<any> { return this.apiClient.request<any>('/api/v1/ocupaciones'); }
  getProvincias(idDepartamento: number | string): Promise<any> { return this.apiClient.request<any>(`/api/v1/provincias/${idDepartamento}`); }
  getDistritos(idProvincia: number | string): Promise<any> { return this.apiClient.request<any>(`/api/v1/distritos/${idProvincia}`); }
  getCentrosPoblados(idDistrito: number | string): Promise<any> { return this.apiClient.request<any>(`/api/v1/centros-poblados/${idDistrito}`); }
  getEspecialidades(): Promise<any> { return this.apiClient.request<any>('/api/v1/especialidades'); }
  getServicios(idArea: number | string): Promise<any> { return this.apiClient.request<any>(`/api/v1/servicios/${idArea}`); }
  getDatosInstitucion(): Promise<any> { return this.apiClient.request<any>('/api/v1/datos-institucion'); }
}
