var PacientesApiService_1;
import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ApiClientService, ApiRequestError, } from '../../../../../compartido/api-client/api-client.service';
let PacientesApiService = class PacientesApiService {
    static { PacientesApiService_1 = this; }
    apiClient = inject(ApiClientService);
    static RENIEC_TIMEOUT_MS = 30000;
    listar(params) {
        return this.apiClient.request(`/api/v1/pacientes?${params}`);
    }
    buscar(params) {
        return this.apiClient.request(`/api/v1/pacientes/buscar?${params}`);
    }
    consultarReniec(nroDocumento) {
        const promesa = this.apiClient.request(`/api/v1/reniec/${encodeURIComponent(nroDocumento)}?operacion=completo`);
        return Promise.race([
            promesa,
            new Promise((_, reject) => setTimeout(() => reject(new ApiRequestError('RENIEC_TIMEOUT', 'RENIEC tardó demasiado en responder. Intente nuevamente o complete los datos manualmente.', 0)), PacientesApiService_1.RENIEC_TIMEOUT_MS)),
        ]);
    }
    porDocumento(nroDocumento, idTipoDocIdentidad) {
        return this.apiClient.request(`/api/v1/pacientes/por-documento?nroDocumento=${encodeURIComponent(nroDocumento)}&idTipoDocIdentidad=${idTipoDocIdentidad}`);
    }
    registrar(payload) {
        return this.apiClient.request('/api/v1/pacientes', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    actualizar(idPaciente, payload) {
        return this.apiClient.request(`/api/v1/pacientes/${idPaciente}`, { method: 'PUT', body: JSON.stringify(payload) });
    }
    eliminar(idPaciente) {
        return this.apiClient.request(`/api/v1/pacientes/${idPaciente}`, { method: 'DELETE' });
    }
    obtener(idPaciente) {
        return this.apiClient.request(`/api/v1/pacientes/${idPaciente}`);
    }
};
PacientesApiService = PacientesApiService_1 = __decorate([
    Injectable({
        providedIn: 'root',
    })
], PacientesApiService);
export { PacientesApiService };
