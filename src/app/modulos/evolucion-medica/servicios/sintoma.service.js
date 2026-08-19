import { Injectable, inject } from '@angular/core';
import { __decorate } from 'tslib';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';

let SintomaService = class SintomaService {
  api = inject(ApiClientService);
  async listarCatalogo() {
    try {
      const datos = await this.api.request('/api/v1/sintomas/catalogo', {
        method: 'GET',
      });
      return datos ?? [];
    } catch (error) {
      console.error('Error al listar catálogo de síntomas:', error);
      return [];
    }
  }
  async agregarSintoma(sistema, sintoma) {
    try {
      await this.api.request('/api/v1/sintomas/catalogo', {
        method: 'POST',
        body: JSON.stringify({ sistema, sintoma }),
      });
      return true;
    } catch (error) {
      console.error('Error al agregar síntoma al catálogo:', error);
      return false;
    }
  }
  async guardarSintomas(idRegAtencion, sintomas) {
    try {
      await this.api.request(`/api/v1/evoluciones/${idRegAtencion}/sintomas`, {
        method: 'POST',
        body: JSON.stringify({ sintomas }),
      });
      return true;
    } catch (error) {
      console.error('Error al guardar síntomas de la evolución:', error);
      return false;
    }
  }
};
SintomaService = __decorate(
  [
    Injectable({
      providedIn: 'root',
    }),
  ],
  SintomaService,
);

export { SintomaService };
