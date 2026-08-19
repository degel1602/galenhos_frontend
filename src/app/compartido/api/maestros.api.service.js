import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../api-client/api-client.service';
let MaestrosApiService = class MaestrosApiService {
    apiClient = inject(ApiClientService);
    getTiposDocumentos() { return this.apiClient.request('/api/v1/tipos-documentos'); }
    getIdiomas() { return this.apiClient.request('/api/v1/idiomas').then(res => res.map(i => ({ id: i.id, descripcion: i.lengua || i.descripcion }))); }
    // El backend de etnias devuelve { codigo, descripcion } (no "id"); se mapea
    // codigo como id para que el select coincida con el IdEtnia del paciente.
    getEtnias() {
        return this.apiClient.request('/api/v1/etnias').then(res => (res || []).map(e => ({ id: e.codigo ?? e.id, descripcion: e.descripcion })));
    }
    getDepartamentos() { return this.apiClient.request('/api/v1/departamentos'); }
    getPaises() { return this.apiClient.request('/api/v1/paises'); }
    getTiposSexo() { return this.apiClient.request('/api/v1/tipos-sexo'); }
    getEstadosCivil() { return this.apiClient.request('/api/v1/estados-civil'); }
    getEstadosLlegoPaciente() { return this.apiClient.request('/api/v1/estados-llego-paciente'); }
    getFuentesFinanciamiento() { return this.apiClient.request('/api/v1/fuentes-financiamiento'); }
    getGradosInstruccion() { return this.apiClient.request('/api/v1/grados-instruccion'); }
    getOcupaciones() { return this.apiClient.request('/api/v1/ocupaciones'); }
    getProvincias(idDepartamento) { return this.apiClient.request(`/api/v1/provincias/${idDepartamento}`); }
    getDistritos(idProvincia) { return this.apiClient.request(`/api/v1/distritos/${idProvincia}`); }
    getCentrosPoblados(idDistrito) { return this.apiClient.request(`/api/v1/centros-poblados/${idDistrito}`); }
    getEspecialidades() { return this.apiClient.request('/api/v1/especialidades'); }
    getServicios(idArea) { return this.apiClient.request(`/api/v1/servicios/${idArea}`); }
    getDatosInstitucion() { return this.apiClient.request('/api/v1/datos-institucion'); }
    getParametro(id) { return this.apiClient.request(`/api/v1/parametros/${id}`); }
    // RENIEC puede devolver el objeto de datos con campos ausentes.
    consultarReniec(nroDocumento) {
        return this.apiClient.request(`/api/v1/reniec/${encodeURIComponent(nroDocumento)}?operacion=completo`);
    }
};
MaestrosApiService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], MaestrosApiService);
export { MaestrosApiService };
