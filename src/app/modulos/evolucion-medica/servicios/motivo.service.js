import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';
let MotivoService = class MotivoService {
    api = inject(ApiClientService);
    async listarMotivos(idRegAtencion) {
        try {
            const datos = await this.api.request(`/api/v1/evoluciones/${idRegAtencion}/motivos`, { method: 'GET' });
            if (!datos)
                return [];
            return datos.map((item, index) => this.parsearMotivo(item, idRegAtencion, index));
        }
        catch (error) {
            console.error('Error al listar motivos:', error);
            return [];
        }
    }
    async crearMotivo(idRegAtencion, motivo) {
        try {
            const textoMotivo = `[${motivo.tipo}] ${motivo.descripcion}`;
            await this.api.request(`/api/v1/evoluciones/${idRegAtencion}/motivos`, {
                method: 'POST',
                body: JSON.stringify({ motivo: textoMotivo }),
            });
            return true;
        }
        catch (error) {
            console.error('Error al crear motivo:', error);
            return false;
        }
    }
    parsearMotivo(item, idRegAtencion, index) {
        const regex = /^\[([^\]]+)\]\s*([\s\S]*)$/;
        const coincidencia = regex.exec(item.motivo);
        return {
            idMotivoAtencion: index + 1,
            idRegAtencion,
            tipo: coincidencia ? coincidencia[1] : 'Consulta',
            descripcion: coincidencia ? coincidencia[2].trim() : item.motivo,
            fechaRegistro: item.fechaRegistro,
        };
    }
};
MotivoService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], MotivoService);
export { MotivoService };
