import { computed, Injectable, inject, signal } from '@angular/core';
import { __decorate } from 'tslib';
import { ApiClientService } from '../../../compartido/api-client/api-client.service';

let EvolucionService = class EvolucionService {
  api = inject(ApiClientService);
  viewMode = signal('tray');
  patientSearch = signal('');
  fechaDesde = signal('');
  fechaHasta = signal('');
  pacientes = signal([]);
  isLoading = signal(false);
  page = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  pageSize = signal(7);
  activePatient = signal(null);
  filteredPacientes = computed(() => {
    const term = this.patientSearch().toLowerCase();
    if (!term) return this.pacientes();
    return this.pacientes().filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.historia.toLowerCase().includes(term),
    );
  });
  async cargarPacientes(resetPage = true) {
    if (resetPage) this.page.set(1);
    this.isLoading.set(true);
    try {
      const params = new URLSearchParams();
      let fini = this.fechaDesde();
      if (!fini) {
        const now = new Date();
        const mes = String(now.getMonth() + 1).padStart(2, '0');
        fini = `${now.getFullYear()}-${mes}-01`;
      }
      params.append('fini', fini);
      if (this.fechaHasta()) params.append('ffin', this.fechaHasta());
      params.append('page', this.page().toString());
      params.append('pageSize', this.pageSize().toString());
      const qs = params.toString();
      const url = `/api/v1/evoluciones/pacientes?${qs}`;
      const data = await this.api.request(url, {
        method: 'GET',
      });
      if (data) {
        this.pacientes.set(data.items ?? data);
        if (Array.isArray(data)) {
          this.totalPages.set(1);
          this.totalItems.set(data.length);
        } else {
          this.page.set(data.page ?? 1);
          this.totalPages.set(data.totalPages ?? 1);
          this.totalItems.set(data.totalItems ?? data.items?.length ?? 0);
        }
      }
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
  irAPagina(pagina) {
    if (pagina < 1 || pagina > this.totalPages() || pagina === this.page())
      return;
    this.page.set(pagina);
    this.cargarPacientes(false);
  }
  async guardarEvolucion(dataB64) {
    const paciente = this.activePatient();
    if (!paciente) return null;
    try {
      const data = await this.api.request('/api/v1/evoluciones', {
        method: 'POST',
        body: JSON.stringify({
          idRegAtencion: paciente.idRegAtencion,
          dataB64: dataB64,
        }),
      });
      return {
        ipCliente: data?.ipCliente ?? '',
        fecha: data?.fecha ?? '',
        hora: data?.hora ?? '',
      };
    } catch (error) {
      console.error('Error guardando evolución:', error);
      return null;
    }
  }
  async listarEvoluciones(idRegAtencion) {
    try {
      const data = await this.api.request(
        `/api/v1/evoluciones/paciente/${idRegAtencion}`,
        { method: 'GET' },
      );
      return data ?? [];
    } catch (error) {
      console.error('Error listando evoluciones del paciente:', error);
      return [];
    }
  }
  decodificarEvolucion(dataB64) {
    try {
      const binario = atob(dataB64);
      let texto = '';
      for (let i = 0; i < binario.length; i++) {
        const code = binario.codePointAt(i) || 0;
        texto +=
          code > 127 ? `%${code.toString(16).padStart(2, '0')}` : binario[i];
      }
      return JSON.parse(decodeURIComponent(texto));
    } catch (error) {
      console.error('Error decodificando evolución:', error);
      return null;
    }
  }
  setViewMode(mode) {
    this.viewMode.set(mode);
  }
  normalizarEdad(edad) {
    if (!edad) return 'N/A';
    const regexEdad = /^\D*(-?\d+)\D+(-?\d+)\D+(-?\d+)\D*$/;
    const match = regexEdad.exec(edad);
    if (!match) return edad;
    let anios = Number(match[1]);
    let meses = Number(match[2]);
    let dias = Number(match[3]);
    while (dias < 0) {
      meses -= 1;
      dias += 30;
    }
    while (meses < 0) {
      anios -= 1;
      meses += 12;
    }
    return `${anios} años, ${meses} meses, ${dias} días`;
  }
  selectPatient(paciente) {
    this.activePatient.set(paciente);
  }
  clearSelection() {
    this.activePatient.set(null);
    this.setViewMode('tray');
    this.cargarPacientes();
  }
};
EvolucionService = __decorate(
  [
    Injectable({
      providedIn: 'root',
    }),
  ],
  EvolucionService,
);

export { EvolucionService };
