import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';
let OrdenService = class OrdenService {
    api = inject(ApiClientService);
    async listarPorCuenta(idRegAtencion) {
        try {
            const data = await this.api.request(`/api/v1/ordenes/cuenta/${idRegAtencion}`, { method: 'GET' });
            return data || [];
        }
        catch (error) {
            console.error('Error al listar ordenes:', error);
            return [];
        }
    }
    async crearOrden(orden) {
        try {
            await this.api.request('/api/v1/ordenes', {
                method: 'POST',
                body: JSON.stringify(orden),
            });
            return true;
        }
        catch (error) {
            console.error('Error al crear orden:', error);
            return false;
        }
    }
    async buscarProductos(filtro, limite = 20) {
        try {
            const q = encodeURIComponent(filtro);
            const data = await this.api.request(`/api/v1/ordenes/productos?q=${q}&limite=${limite}`, { method: 'GET' });
            return data || [];
        }
        catch (error) {
            console.error('Error al buscar productos:', error);
            return [];
        }
    }
};
OrdenService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], OrdenService);
export { OrdenService };
