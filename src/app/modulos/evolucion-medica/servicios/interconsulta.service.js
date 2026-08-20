import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';
let InterconsultaService = class InterconsultaService {
    api = inject(ApiClientService);
    async obtenerPorId(id) {
        try {
            const data = await this.api.request(`/api/v1/interconsultas/${id}`, { method: 'GET' });
            return data;
        }
        catch (error) {
            console.error('Error al obtener interconsulta:', error);
            return null;
        }
    }
    async listarPorServicio(tipoServicio) {
        try {
            const data = await this.api.request(`/api/v1/interconsultas/servicio/${tipoServicio}`, { method: 'GET' });
            return data || [];
        }
        catch (error) {
            console.error('Error al listar interconsultas:', error);
            return [];
        }
    }
    async listarPorAtencion(idAtencion) {
        try {
            const data = await this.api.request(`/api/v1/interconsultas/atencion/${idAtencion}`, { method: 'GET' });
            return data || [];
        }
        catch (error) {
            console.error('Error al listar interconsultas por atenci\u00f3n:', error);
            return [];
        }
    }
    async crear(interconsulta) {
        try {
            await this.api.request('/api/v1/interconsultas', {
                method: 'POST',
                body: JSON.stringify(interconsulta),
            });
            return true;
        }
        catch (error) {
            console.error('Error al crear interconsulta:', error);
            return false;
        }
    }
    async actualizarEstado(id, estado) {
        try {
            await this.api.request(`/api/v1/interconsultas/${id}/estado`, {
                method: 'PUT',
                body: JSON.stringify({ estado }),
            });
            return true;
        }
        catch (error) {
            console.error('Error al actualizar estado:', error);
            return false;
        }
    }
    async firmar(id, dataB64) {
        try {
            await this.api.request(`/api/v1/interconsultas/${id}/firma`, {
                method: 'POST',
                body: JSON.stringify({ dataB64 }),
            });
            return true;
        }
        catch (error) {
            console.error('Error al firmar interconsulta:', error);
            return false;
        }
    }
    async listarEspecialidades() {
        try {
            const data = await this.api.request('/api/v1/interconsultas/especialidades', { method: 'GET' });
            return data || [];
        }
        catch (error) {
            console.error('Error al listar especialidades de interconsulta:', error);
            return [];
        }
    }
    async listarMedicosPorEspecialidad(idEspecialidad) {
        try {
            const data = await this.api.request(`/api/v1/interconsultas/medicos/${idEspecialidad}`, { method: 'GET' });
            return data || [];
        }
        catch (error) {
            console.error('Error al listar m\u00e9dicos por especialidad:', error);
            return [];
        }
    }
};
InterconsultaService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], InterconsultaService);
export { InterconsultaService };
