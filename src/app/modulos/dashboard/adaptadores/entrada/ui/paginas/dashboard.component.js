import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { __decorate } from 'tslib';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { DashboardApiService } from '../../../salida/http/dashboard.api.service';

let DashboardComponent = class DashboardComponent {
  dashboardApi = inject(DashboardApiService);
  router = inject(Router);
  totalPacientes = null;
  error = '';
  apiBaseUrl = '';
  cancelled = false;
  ngOnInit() {
    this.apiBaseUrl = this.dashboardApi.getApiBaseUrl();
    this.cargarPacientes();
  }
  ngOnDestroy() {
    this.cancelled = true;
  }
  async cargarPacientes() {
    try {
      const res = await this.dashboardApi.listPacientes(1, 1);
      if (!this.cancelled) {
        this.totalPacientes = res.totalItems;
      }
    } catch (err) {
      if (this.cancelled) return;
      if (err instanceof ApiRequestError) {
        this.error = err.message;
      } else {
        this.error = 'No se pudo obtener el resumen de pacientes.';
      }
    }
  }
  navigateTo(route) {
    this.router.navigate([`/${route}`]);
  }
};
DashboardComponent = __decorate(
  [
    Component({
      selector: 'app-dashboard',
      standalone: true,
      templateUrl: './dashboard.component.html',
    }),
  ],
  DashboardComponent,
);

export { DashboardComponent };
