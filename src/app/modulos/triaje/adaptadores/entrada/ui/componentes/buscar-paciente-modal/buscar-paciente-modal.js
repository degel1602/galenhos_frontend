import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { __decorate } from 'tslib';
import { MaestrosApiService } from '../../../../../../../compartido/api/maestros.api.service';
import { ApiRequestError } from '../../../../../../../compartido/api-client/api-client.service';
import { VentanaModal } from '../../../../../../../compartido/ui/ventana-modal/ventana-modal';
import { PacientesApiService } from '../../../../../../pacientes/adaptadores/salida/http/pacientes.api.service';

let BuscarPacienteModal = class BuscarPacienteModal {
  alCerrar = new EventEmitter();
  seleccionado = new EventEmitter();
  pacientesApi = inject(PacientesApiService);
  maestrosApi = inject(MaestrosApiService);
  cdr = inject(ChangeDetectorRef);
  filtros = {
    apellidoPaterno: '',
    apellidoMaterno: '',
    primerNombre: '',
  };
  tiposDocumentos = [];
  resultados = [];
  cargando = false;
  buscado = false;
  error = '';
  ngOnInit() {
    void this.maestrosApi.getTiposDocumentos().then((tipos) => {
      this.tiposDocumentos = tipos || [];
    });
  }
  async buscar() {
    const pat = this.filtros.apellidoPaterno.trim();
    const mat = this.filtros.apellidoMaterno.trim();
    const nom = this.filtros.primerNombre.trim();
    if (!pat && !mat && !nom) {
      this.error = 'Ingrese al menos un apellido o nombre para buscar.';
      return;
    }
    this.cargando = true;
    this.buscado = false;
    this.error = '';
    this.resultados = [];
    try {
      const query = new URLSearchParams();
      query.append('paterno', pat);
      query.append('materno', mat);
      query.append('nombres', nom);
      const res = await this.pacientesApi.buscar(query.toString());
      this.resultados = res || [];
      this.buscado = true;
    } catch (err) {
      this.error =
        err instanceof ApiRequestError
          ? err.message
          : 'No se pudo buscar al paciente.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }
  limpiar() {
    this.filtros = {
      apellidoPaterno: '',
      apellidoMaterno: '',
      primerNombre: '',
    };
    this.resultados = [];
    this.buscado = false;
    this.error = '';
  }
  descripcionTipoDocumento(id) {
    const tipo = this.tiposDocumentos.find((t) => String(t.id) === String(id));
    return tipo?.descripcion ?? '—';
  }
  seleccionar(paciente) {
    this.seleccionado.emit(paciente);
  }
  cerrar() {
    this.alCerrar.emit();
  }
};
__decorate([Output()], BuscarPacienteModal.prototype, 'alCerrar', void 0);
__decorate([Output()], BuscarPacienteModal.prototype, 'seleccionado', void 0);
BuscarPacienteModal = __decorate(
  [
    Component({
      selector: 'app-buscar-paciente-modal',
      standalone: true,
      imports: [CommonModule, FormsModule, VentanaModal],
      templateUrl: './buscar-paciente-modal.html',
      styles: ['@keyframes spin { to { transform: rotate(360deg); } }'],
    }),
  ],
  BuscarPacienteModal,
);

export { BuscarPacienteModal };
