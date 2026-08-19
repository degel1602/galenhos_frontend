import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../../../compartido/api-client/api-client.service';
import type { IAppointment } from '../../../../../compartido/tipos/tipos';

@Injectable({
  providedIn: 'root',
})
export class CitasApiService {
  private apiClient = inject(ApiClientService);

  createCita(payload: {
    patientId: string;
    doctorId: string;
    startsAt: string;
    endsAt: string;
    reason: string;
  }): Promise<IAppointment> {
    return this.apiClient.request<IAppointment>('/api/v1/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getCitaById(id: string): Promise<IAppointment> {
    return this.apiClient.request<IAppointment>(
      `/api/v1/appointments/${encodeURIComponent(id)}`,
    );
  }
}
