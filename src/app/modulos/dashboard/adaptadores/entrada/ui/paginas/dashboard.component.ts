import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { DashboardApiService } from '../../../salida/http/dashboard.api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardApi = inject(DashboardApiService);
  private router = inject(Router);

  totalPacientes: number | null = null;
  error = '';
  apiBaseUrl = '';
  private cancelled = false;

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
    } catch (err: unknown) {
      if (this.cancelled) return;
      if (err instanceof ApiRequestError) {
        this.error = err.message;
      } else {
        this.error = 'No se pudo obtener el resumen de pacientes.';
      }
    }
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
