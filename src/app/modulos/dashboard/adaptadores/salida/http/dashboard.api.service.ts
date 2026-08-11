import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../../../compartido/api-client/api-client.service';
import { IPageResponse, IPatient } from '../../../../../compartido/tipos/tipos';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private apiClient = inject(ApiClientService);

  getApiBaseUrl(): string {
    return this.apiClient.getApiBaseUrl();
  }

  listPacientes(page: number, pageSize: number): Promise<IPageResponse<IPatient>> {
    return this.apiClient.request<IPageResponse<IPatient>>(`/api/v1/pacientes?page=${page}&pageSize=${pageSize}`);
  }
}
