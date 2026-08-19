import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  inject,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { __decorate } from 'tslib';
import { ErrorMensajeComponent } from '../../../../../../../compartido/ui/validacion/error-mensaje.component';
import { VentanaModal } from '../../../../../../../compartido/ui/ventana-modal/ventana-modal';
import { BuscarPacienteModal } from '../buscar-paciente-modal/buscar-paciente-modal';
import { ReporteTriajeComponent } from '../reporte-triaje/reporte-triaje.component';
import { RegistroTriajeService } from './registro-triaje.service';

let RegistroTriajeModal = class RegistroTriajeModal {
  abierto = false;
  alCerrar = new EventEmitter();
  triajeIniciado = new EventEmitter();
  srv = inject(RegistroTriajeService);
  cdr = inject(ChangeDetectorRef);
  reporteId = null;
  mostrarPaciente = true;
  buscarAbierto = false;
  imc = '';
  ngOnInit() {
    void this.srv.cargarCatalogosIniciales();
  }
  cerrar() {
    this.srv.limpiarEstado();
    this.reporteId = null;
    this.mostrarPaciente = true;
    this.imc = '';
    this.alCerrar.emit();
  }
  async buscarPaciente() {
    await this.srv.buscarPaciente();
    this.mostrarPaciente = true;
    this.cdr.detectChanges();
  }
  onEnterDocumento(_event) {
    if (!this.srv.buscando && !this.srv.formulario.pacienteNn) {
      this.buscarPaciente();
    }
  }
  abrirBuscador() {
    this.buscarAbierto = true;
    this.cdr.detectChanges();
  }
  cerrarBuscador() {
    this.buscarAbierto = false;
    this.cdr.detectChanges();
  }
  onPacienteSeleccionado(paciente) {
    this.buscarAbierto = false;
    // Autocompleta tipo de documento y número de documento del formulario de triaje.
    const idTipo = paciente.docIdentityId;
    if (idTipo !== undefined && idTipo !== null) {
      this.srv.formulario.idDocIdentidad = String(idTipo);
    }
    if (paciente.documentNumber) {
      this.srv.formulario.nroDocumento = String(paciente.documentNumber);
    }
    this.cdr.detectChanges();
  }
  toggleNN(checked) {
    this.srv.formulario.pacienteNn = checked;
    this.srv.mensajeError = '';
    this.srv.sisConsultado = false;
    this.srv.sisActivo = false;
    this.srv.sisGuardado = false;
    if (checked) {
      const sd = this.srv.tiposDocumentos.find(
        (t) => (t.descripcion || '').toUpperCase() === 'SD',
      );
      this.srv.formulario.idDocIdentidad = sd ? String(sd.id) : '';
      this.srv.formulario.nroDocumento = '';
      this.srv.formulario.apellidoPaterno = 'NN';
      this.srv.formulario.apellidoMaterno = 'NN';
      this.srv.formulario.primerNombre = 'NN';
      this.srv.formulario.segundoNombre = '';
      this.srv.pacienteEncontrado = true;
      this.srv.actualizarIafaAutomatico();
      this.srv.avanzarPaso();
      this.mostrarPaciente = true;
    } else {
      this.srv.formulario.idDocIdentidad = '1';
      this.srv.formulario.nroDocumento = '';
      this.srv.formulario.apellidoPaterno = '';
      this.srv.formulario.apellidoMaterno = '';
      this.srv.formulario.primerNombre = '';
      this.srv.formulario.segundoNombre = '';
      this.srv.pacienteEncontrado = false;
      this.srv.pasoActual = 1;
      this.mostrarPaciente = true;
    }
    this.cdr.detectChanges();
  }
  cargarProvincias() {
    this.srv.formulario.idProvinciaDomicilio = '';
    this.srv.formulario.idDistritoDomicilio = '';
    this.srv.formulario.idCentroPobladoDomicilio = '';
    this.srv.cargarProvincias();
  }
  cargarDistritos() {
    this.srv.formulario.idDistritoDomicilio = '';
    this.srv.formulario.idCentroPobladoDomicilio = '';
    this.srv.cargarDistritos();
  }
  cargarCentrosPoblados() {
    this.srv.formulario.idCentroPobladoDomicilio = '';
    this.srv.cargarCentrosPoblados();
  }
  calcularImc() {
    const p = parseFloat(this.srv.formulario.peso);
    const t = parseFloat(this.srv.formulario.talla);
    if (!p || !t || p <= 0 || t <= 0) {
      this.imc = '';
      return;
    }
    const result = p / (t / 100) ** 2;
    this.imc = result.toFixed(1);
  }
  toggleAccidente() {
    this.srv.formulario.esAccidenteTransito =
      !this.srv.formulario.esAccidenteTransito;
    this.srv.actualizarIafaAutomatico();
    this.cdr.detectChanges();
  }
  obtenerSexo() {
    const id = this.srv.formulario.idTipoSexo;
    if (!id) return '—';
    const sexo = this.srv.tiposSexo.find((s) => String(s.id) === String(id));
    return sexo ? (sexo.descripcion ?? '—') : '—';
  }
  continuar() {
    if (!this.srv.pacienteEncontrado) {
      this.srv.mensajeError =
        'Busque el documento del paciente antes de continuar.';
      this.cdr.detectChanges();
      return;
    }
    this.srv.mensajeError = '';
    this.srv.avanzarPaso();
    this.mostrarPaciente = false;
    this.cdr.detectChanges();
  }
  seleccionarPrioridad(value) {
    this.srv.formulario.idTipoPrioridad = value;
    if (value === '6') {
      this.srv.formulario.frecCardiaca = '';
      this.srv.formulario.temperatura = '';
      this.srv.formulario.presionArterial = '';
      this.srv.formulario.saturacion = '';
      this.srv.formulario.frecRespiratoria = '';
      this.srv.formulario.fiO2 = '';
      this.srv.formulario.peso = '';
      this.srv.formulario.talla = '';
      this.imc = '';
    }
    this.cdr.detectChanges();
  }
  async registrar() {
    await this.srv.guardarYContinuar();
    this.cdr.detectChanges();
    if (!this.srv.mensajeError) {
      if (this.srv.ultimoTriajeId) {
        this.reporteId = this.srv.ultimoTriajeId;
        this.cdr.detectChanges();
      } else {
        this.triajeIniciado.emit();
        this.cerrar();
      }
    }
  }
  cerrarReporte() {
    this.reporteId = null;
    this.triajeIniciado.emit();
    this.cerrar();
  }
};
__decorate([Input()], RegistroTriajeModal.prototype, 'abierto', void 0);
__decorate([Output()], RegistroTriajeModal.prototype, 'alCerrar', void 0);
__decorate([Output()], RegistroTriajeModal.prototype, 'triajeIniciado', void 0);
RegistroTriajeModal = __decorate(
  [
    Component({
      selector: 'app-registro-triaje-modal',
      standalone: true,
      imports: [
        CommonModule,
        FormsModule,
        VentanaModal,
        ReporteTriajeComponent,
        ErrorMensajeComponent,
        BuscarPacienteModal,
      ],
      providers: [RegistroTriajeService],
      templateUrl: './registro-triaje-modal.html',
      styles: [`@keyframes spin { to { transform: rotate(360deg); } }`],
    }),
  ],
  RegistroTriajeModal,
);

export { RegistroTriajeModal };
