import { Injectable, inject } from '@angular/core';
import { __decorate } from 'tslib';
import { ApiClientService } from '../../../../../compartido/api-client/api-client.service';

let CitasApiService = class CitasApiService {
  apiClient = inject(ApiClientService);
  createCita(payload) {
    return this.apiClient.request('/api/v1/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  getCitaById(id) {
    return this.apiClient.request(
      `/api/v1/appointments/${encodeURIComponent(id)}`,
    );
  }
};
CitasApiService = __decorate(
  [
    Injectable({
      providedIn: 'root',
    }),
  ],
  CitasApiService,
);

export { CitasApiService };
