import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../../../compartido/api-client/api-client.service';
let DashboardApiService = class DashboardApiService {
    apiClient = inject(ApiClientService);
    getApiBaseUrl() {
        return this.apiClient.getApiBaseUrl();
    }
    listPacientes(page, pageSize) {
        return this.apiClient.request(`/api/v1/pacientes?page=${page}&pageSize=${pageSize}`);
    }
};
DashboardApiService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], DashboardApiService);
export { DashboardApiService };
