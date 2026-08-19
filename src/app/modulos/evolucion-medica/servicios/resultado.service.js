import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';
let ResultadoService = class ResultadoService {
    api = inject(ApiClientService);
    async listarLaboratorio(idPaciente) {
        try {
            const datos = await this.api.request(`/api/v1/resultados/laboratorio/paciente/${idPaciente}`, { method: 'GET' });
            return (datos ?? []).map(this.normalizarResultado);
        }
        catch (error) {
            console.error('Error al listar resultados de laboratorio:', error);
            return [];
        }
    }
    async listarImagenes(idPaciente) {
        try {
            const datos = await this.api.request(`/api/v1/resultados/imagenes/paciente/${idPaciente}`, { method: 'GET' });
            return (datos ?? []).map(this.normalizarResultado);
        }
        catch (error) {
            console.error('Error al listar resultados de imágenes:', error);
            return [];
        }
    }
    normalizarResultado(item) {
        return {
            idResultado: item.idResultado,
            idPaciente: item.idPaciente,
            tipoResultado: item.tipoResultado ?? '',
            nombreExamen: item.nombreExamen ?? '',
            fechaResultado: item.fechaExamen ?? item.fechaResultado ?? '',
            valores: item.detalle ?? item.valores ?? '',
            observaciones: item.observaciones ?? '',
            estado: item.estado ?? 'Pendiente',
        };
    }
};
ResultadoService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], ResultadoService);
export { ResultadoService };
