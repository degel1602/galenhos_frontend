import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaestrosApiService } from '../../../../../../compartido/api/maestros.api.service';
import { TriajeApiService, CrearAdmisionPayload } from '../../../../../triaje/adaptadores/salida/http/triaje.api.service';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { ICatalogoNombre, IFilaBackend } from '../../../../../../compartido/tipos/api-tipos';
import { AuthService } from '../../../../../auth/aplicacion/auth.service';
import { VentanaModal } from '../../../../../../compartido/ui/ventana-modal/ventana-modal';
import { FichaAdmisionComponent } from '../componentes/ficha-admision/ficha-admision.component';
import { SisFuaReportComponent } from '../componentes/sis-fua-report/sis-fua-report.component';

const TIPO_PRIORIDAD_INFO: Record<number, { label: string; bg: string; text: string; dot: string }> = {
  1: { label: 'I. Emerg. o Gravedad', bg: '#fee2e2', text: '#b91c1c', dot: '#dc2626' },
  2: { label: 'II. Urgencia Mayor', bg: '#ffedd5', text: '#c2410c', dot: '#f97316' },
  3: { label: 'III. Urgencia Menor', bg: '#fef9c3', text: '#a16207', dot: '#eab308' },
  4: { label: 'IV. Patología Aguda Común', bg: '#d1fae5', text: '#047857', dot: '#10b981' },
  5: { label: 'Llegó Cadáver', bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
};

function campo(item: IFilaBackend | null | undefined, claves: string[]): string {
  if (!item) return '';
  for (const k of claves) {
    const v = item[k];
    if (v !== undefined && v !== null && v !== '') {
      if (typeof v === 'string') return v;
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      return JSON.stringify(v);
    }
  }
  return '';
}

function campoNum(item: IFilaBackend | null | undefined, claves: string[]): number {
  const raw = campo(item, claves);
  return Number(raw) || 0;
}

@Component({
  selector: 'app-admisiones',
  standalone: true,
  imports: [FormsModule, CommonModule, VentanaModal, FichaAdmisionComponent, SisFuaReportComponent],
  templateUrl: './admisiones.component.html'
})
export class AdmisionesComponent implements OnInit {
  private readonly maestrosApi = inject(MaestrosApiService);
  private readonly triajeApi = inject(TriajeApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  public readonly authService = inject(AuthService);

  fecha = new Date().toISOString().slice(0, 10);
  filtro = '';
  idDepartamento = '0';
  idEspecialidad = '0';
  idServicio = '0';

  departamentos: ICatalogoNombre[] = [];
  especialidades: ICatalogoNombre[] = [];
  servicios: ICatalogoNombre[] = [];

  items: IFilaBackend[] = [];
  cargando = false;
  error = '';
  buscar = false;

  modalAdmision: IFilaBackend | null = null;
  formAdmision: { nombreAcompanante: string; telefonoAcompanante: string; direccionPaciente: string; observacion: string; idEmpleado: number | '' } = { nombreAcompanante: '', telefonoAcompanante: '', direccionPaciente: '', observacion: '', idEmpleado: '' };
  guardando = false;
  errorAdmision = '';

  medicosDisponibles: IFilaBackend[] = [];
  cargandoMedicos = false;

  mensajeExito = '';

  modalFichaId: number | null = null;
  modalFuaId: number | null = null;

  ngOnInit() {
    this.cargarCatalogos();
  }

  async cargarCatalogos() {
    try {
      const [d, e, s] = await Promise.all([
        this.maestrosApi.getDepartamentos(),
        this.maestrosApi.getEspecialidades(),
        this.maestrosApi.getServicios(2)
      ]);
      if (Array.isArray(d)) this.departamentos = d;
      if (Array.isArray(e)) this.especialidades = e;
      if (Array.isArray(s)) this.servicios = s;
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  }

  async handleBuscar() {
    this.cargando = true;
    this.error = '';
    this.mensajeExito = '';
    try {
      const items = await this.triajeApi.listarPendientesAdmision({
        fecha: this.fecha,
        filtro: this.filtro || undefined,
        idDepartamento: this.idDepartamento !== '0' ? Number(this.idDepartamento) : undefined,
        idEspecialidad: this.idEspecialidad !== '0' ? Number(this.idEspecialidad) : undefined,
        idServicio: this.idServicio !== '0' ? Number(this.idServicio) : undefined
      });
      this.items = Array.isArray(items) ? items : [];
      this.buscar = true;
    } catch (err: unknown) {
      this.error = err instanceof ApiRequestError ? err.message : 'No se pudo obtener la bandeja de admisiones.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalAdmision(item: IFilaBackend) {
    this.modalAdmision = item;
    this.formAdmision = {
      nombreAcompanante: '',
      telefonoAcompanante: '',
      direccionPaciente: campo(item, ['Direccion', 'direccion', 'DireccionDomicilio']) || '',
      observacion: '',
      idEmpleado: ''
    };
    this.errorAdmision = '';
    this.cargarMedicos(item);
  }

  async cargarMedicos(item: IFilaBackend) {
    const idEspecialidad = campoNum(item, ['IdEspecialidad', 'idEspecialidad', 'Especialidad']);
    if (!idEspecialidad) return;
    this.cargandoMedicos = true;
    try {
      const medicos = await this.triajeApi.medicosPorEspecialidad(idEspecialidad);
      this.medicosDisponibles = Array.isArray(medicos) ? medicos : [];
    } catch {
      this.medicosDisponibles = [];
    } finally {
      this.cargandoMedicos = false;
      this.cdr.detectChanges();
    }
  }

  cerrarModalAdmision() {
    this.modalAdmision = null;
    this.medicosDisponibles = [];
  }

  handleAdmisionExitosa(mensaje: string) {
    this.modalAdmision = null;
    this.mensajeExito = mensaje || 'Admisión registrada correctamente.';
    this.handleBuscar();
  }

  async admitir() {
    const item = this.modalAdmision;
    if (!item) return;
    const idTriaje = campoNum(item, ['IdTriaje', 'idTriaje', 'IDTriaje']);
    const idPacienteTriaje = campoNum(item, ['IdPacienteTriaje', 'idPacienteTriaje', 'IdPaciente', 'idPaciente']);
    if (!idTriaje || !idPacienteTriaje) {
      this.errorAdmision = 'El registro no tiene un id de triaje válido.';
      return;
    }
    if (!this.formAdmision.nombreAcompanante.trim()) {
      this.errorAdmision = 'El nombre del acompañante es obligatorio.';
      return;
    }
    if (!this.formAdmision.telefonoAcompanante.trim()) {
      this.errorAdmision = 'El teléfono del acompañante es obligatorio.';
      return;
    }
    if (!this.formAdmision.direccionPaciente.trim()) {
      this.errorAdmision = 'La dirección del paciente es obligatoria.';
      return;
    }
    this.guardando = true;
    this.errorAdmision = '';
    const payload: CrearAdmisionPayload = {
      idTriaje,
      idPacienteTriaje,
      idEmpleado: this.formAdmision.idEmpleado ? Number(this.formAdmision.idEmpleado) : undefined,
      nombreAcompanante: this.formAdmision.nombreAcompanante.trim() || undefined,
      telefonoAcompanante: this.formAdmision.telefonoAcompanante.trim() || undefined,
      direccionPaciente: this.formAdmision.direccionPaciente.trim() || undefined,
      observacion: this.formAdmision.observacion.trim() || undefined,
    };
    try {
      const resp = await this.triajeApi.crearAdmision(payload);
      this.handleAdmisionExitosa(resp?.resultado || 'Admisión registrada correctamente.');
    } catch (err: unknown) {
      this.errorAdmision = err instanceof ApiRequestError ? err.message : 'No se pudo registrar la admisión.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  abrirFicha(item: IFilaBackend) {
    const id = campoNum(item, ['IdCuentaAtencion', 'idCuentaAtencion', 'NroCuenta', 'nroCuenta', 'Cuenta', 'cuenta']);
    if (id) this.modalFichaId = id;
  }

  cerrarFicha() {
    this.modalFichaId = null;
  }

  abrirFua(item: IFilaBackend) {
    const id = campoNum(item, ['IdCuentaAtencion', 'idCuentaAtencion']);
    if (id) this.modalFuaId = id;
  }

  cerrarFua() {
    this.modalFuaId = null;
  }

  cerrarExito() {
    this.mensajeExito = '';
  }

  // --- Helpers de render ---
  idCuentaAtencion(item: IFilaBackend): number {
    return campoNum(item, ['IdCuentaAtencion', 'idCuentaAtencion', 'NroCuenta', 'nroCuenta', 'Cuenta', 'cuenta']);
  }

  idTipoPrioridad(item: IFilaBackend): number {
    return campoNum(item, ['IdTipoPrioridad', 'idTiposGravedad', 'IdTiposGravedad']);
  }

  prioridadInfo(item: IFilaBackend): { label: string; bg: string; text: string; dot: string } | null {
    const id = this.idTipoPrioridad(item);
    return TIPO_PRIORIDAD_INFO[id] || null;
  }

  prioridadTexto(item: IFilaBackend): string {
    return campo(item, ['Prioridad', 'prioridad', 'TipoPrioridad', 'tipoPrioridad', 'DescripcionPrioridad']);
  }

  nombrePaciente(item: IFilaBackend): string {
    const completo = campo(item, ['Paciente', 'paciente', 'NombreCompleto', 'nombreCompleto', 'Nombre', 'nombre']);
    if (completo) return completo;
    const partes = [
      campo(item, ['ApellidoPaterno', 'apellidoPaterno']),
      campo(item, ['ApellidoMaterno', 'apellidoMaterno']),
      campo(item, ['PrimerNombre', 'primerNombre']),
      campo(item, ['SegundoNombre', 'segundoNombre'])
    ].filter(Boolean);
    return partes.join(' ') || 'Paciente NN';
  }

  documento(item: IFilaBackend): string {
    return campo(item, ['NroDocumento', 'nroDocumento', 'Documento', 'documento']);
  }

  servicio(item: IFilaBackend): string {
    return campo(item, ['Servicio', 'servicio', 'Descripcion', 'descripcion']);
  }

  tipoIngreso(item: IFilaBackend): string {
    return campo(item, ['TipoIngreso', 'tipoIngreso']);
  }

  iafa(item: IFilaBackend): string {
    return campo(item, ['IAFA', 'iafa', 'FuenteFinanciamiento']);
  }

  esSis(item: IFilaBackend): boolean {
    return this.iafa(item).toUpperCase().includes('SIS');
  }

  formatFechaTriaje(item: IFilaBackend): string {
    const raw = campo(item, ['fecha_Triaje', 'FechaTriaje', 'fechaTriaje', 'FechaRegistro', 'fechaRegistro']);
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' +
           d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  sanitizar(texto: string): string {
    return texto.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '').trim();
  }

  soloDigitos(event: KeyboardEvent) {
    if (event.key.length === 1 && !/\d/.test(event.key)) {
      event.preventDefault();
    }
  }
}
