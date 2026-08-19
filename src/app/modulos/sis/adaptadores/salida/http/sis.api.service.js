import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../../../compartido/api-client/api-client.service';
let SisApiService = class SisApiService {
    apiClient = inject(ApiClientService);
    consultarAfiliado(nrodoc, tipoDocumento = 1) {
        return this.apiClient.request(`/api/v1/sis/afiliado/${encodeURIComponent(nrodoc)}?strTipoDocumento=${tipoDocumento}`);
    }
    gestionarAfiliacion(payload) {
        return this.apiClient.request('/api/v1/sis/filiaciones', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    forzarGuardadoFua(idCuentaAtencion) {
        return this.apiClient.request('/api/v1/sis/fua', {
            method: 'POST',
            body: JSON.stringify({ idCuentaAtencion }),
        });
    }
    agregarFua(idCuentaAtencion, idEmpleado, nombrePc) {
        return this.apiClient.request('/api/v1/sis/fua/agregar', {
            method: 'POST',
            body: JSON.stringify({
                idCuentaAtencion,
                idEmpleado,
                ...(nombrePc ? { nombrePc } : {}),
            }),
        });
    }
    fuaImprimir(idCuentaAtencion) {
        return this.apiClient.request(`/api/v1/sis/fua/imprimir?idCuentaAtencion=${idCuentaAtencion}`);
    }
    listarDiagnosticos(idAtencion) {
        return this.apiClient.request(`/api/v1/sis/diagnosticos?idAtencion=${idAtencion}`);
    }
    listarMedicamentos(idCuentaAtencion) {
        return this.apiClient.request(`/api/v1/sis/medicamentos?idCuentaAtencion=${idCuentaAtencion}`);
    }
    listarProcedimientos(idCuentaAtencion) {
        return this.apiClient.request(`/api/v1/sis/procedimientos?idCuentaAtencion=${idCuentaAtencion}`);
    }
    listarConsumo(idCuentaAtencion) {
        return this.apiClient.request(`/api/v1/sis/consumo?idCuentaAtencion=${idCuentaAtencion}`);
    }
};
SisApiService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], SisApiService);
export { SisApiService };
