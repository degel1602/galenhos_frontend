var TriajeApiService_1;
import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ApiClientService, ApiRequestError, } from '../../../../../compartido/api-client/api-client.service';
import { AuthService } from '../../../../auth/aplicacion/auth.service';
let TriajeApiService = class TriajeApiService {
    static { TriajeApiService_1 = this; }
    apiClient = inject(ApiClientService);
    authService = inject(AuthService);
    static RENIEC_TIMEOUT_MS = 30000;
    consultarReniec(nroDocumento) {
        const promesa = this.apiClient.request(`/api/v1/reniec/${encodeURIComponent(nroDocumento)}?operacion=completo`);
        return Promise.race([
            promesa,
            new Promise((_, reject) => setTimeout(() => reject(new ApiRequestError('RENIEC_TIMEOUT', 'RENIEC tardó demasiado en responder. Intente nuevamente o complete los datos manualmente.', 0)), TriajeApiService_1.RENIEC_TIMEOUT_MS)),
        ]);
    }
    registrar(payload) {
        return this.apiClient.request('/api/v1/triaje', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    listar(fini, ffin, derivadoAServicio = '-100', idEstado = '-100') {
        const query = new URLSearchParams({
            fini,
            ffin,
            derivadoAServicio,
            idEstado,
        });
        return this.apiClient.request(`/api/v1/triaje?${query.toString()}`);
    }
    listarPendientesAdmision(params) {
        const query = new URLSearchParams();
        query.append('fecha', params.fecha);
        if (params.filtro)
            query.append('filtro', params.filtro);
        if (params.nroCta)
            query.append('nroCta', String(params.nroCta));
        if (params.idDepartamento)
            query.append('idDepartamento', String(params.idDepartamento));
        if (params.idEspecialidad)
            query.append('idEspecialidad', String(params.idEspecialidad));
        if (params.idServicio)
            query.append('idServicio', String(params.idServicio));
        if (params.idTipoServicio)
            query.append('idTipoServicio', String(params.idTipoServicio));
        return this.apiClient.request(`/api/v1/triaje/pendientes-admision?${query.toString()}`);
    }
    crearAdmision(payload) {
        return this.apiClient.request('/api/v1/triaje/admision', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    obtenerReporte(params) {
        const query = new URLSearchParams();
        if (params.id)
            query.append('id', String(params.id));
        if (params.idPaciente)
            query.append('idPaciente', String(params.idPaciente));
        return this.apiClient.request(`/api/v1/triaje/reporte?${query.toString()}`);
    }
    obtenerFichaAdmision(idCuentaAtencion) {
        return this.apiClient.request(`/api/v1/triaje/ficha-admision?idCuentaAtencion=${idCuentaAtencion}`);
    }
    obtenerDatosInstitucion() {
        return this.apiClient.request('/api/v1/datos-institucion');
    }
    async agregarFua(idCuentaAtencion) {
        try {
            const idEmpleado = this.authService.getIdEmpleado();
            await this.apiClient.request('/api/v1/sis/fua/agregar', {
                method: 'POST',
                body: JSON.stringify({
                    idCuentaAtencion,
                    idEmpleado: idEmpleado > 0 ? idEmpleado : 1,
                    nombrePc: '',
                }),
            });
        }
        catch { }
    }
    imprimirFua(idCuentaAtencion) {
        return this.apiClient.request(`/api/v1/sis/fua/imprimir?idCuentaAtencion=${idCuentaAtencion}`);
    }
    diagnosticosFua(idCuentaAtencion) {
        return this.apiClient.request(`/api/v1/sis/diagnosticos?idCuentaAtencion=${idCuentaAtencion}`);
    }
    medicamentosFua(idCuentaAtencion) {
        return this.apiClient.request(`/api/v1/sis/medicamentos?idCuentaAtencion=${idCuentaAtencion}`);
    }
    procedimientosFua(idCuentaAtencion) {
        return this.apiClient.request(`/api/v1/sis/procedimientos?idCuentaAtencion=${idCuentaAtencion}`);
    }
    consumoFua(idCuentaAtencion) {
        return this.apiClient.request(`/api/v1/sis/consumo?idCuentaAtencion=${idCuentaAtencion}`);
    }
    medicosPorEspecialidad(idEspecialidad) {
        return this.apiClient.request(`/api/v1/triaje/medicos/${idEspecialidad}`);
    }
    listarTriajeConsulta(params) {
        const query = new URLSearchParams({ fini: params.fini, ffin: params.ffin });
        if (params.filtro)
            query.append('filtro', params.filtro);
        if (params.idServicio)
            query.append('idServicio', String(params.idServicio));
        return this.apiClient.request(`/api/v1/triaje/consulta?${query.toString()}`);
    }
    registrarTriajeConsulta(payload) {
        return this.apiClient.request('/api/v1/triaje/consulta', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    obtenerTriajeConsultaPorAtencion(idAtencion) {
        return this.apiClient.request(`/api/v1/triaje/consulta/atencion/${idAtencion}`);
    }
    actualizarEstadoTriajeConsulta(idTriaje, estado) {
        return this.apiClient.request(`/api/v1/triaje/consulta/${idTriaje}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado }),
        });
    }
};
TriajeApiService = TriajeApiService_1 = __decorate([
    Injectable({
        providedIn: 'root',
    })
], TriajeApiService);
export { TriajeApiService };
