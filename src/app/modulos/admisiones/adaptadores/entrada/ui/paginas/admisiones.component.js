import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { __decorate } from 'tslib';
import { MaestrosApiService } from '../../../../../../compartido/api/maestros.api.service';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { ColumnaTemplateDirective } from '../../../../../../compartido/componentes/tabla/columna-template.directive';
import { TablaComponent } from '../../../../../../compartido/componentes/tabla/tabla.component';
import { ErrorMensajeComponent } from '../../../../../../compartido/ui/validacion/error-mensaje.component';
import { VentanaModal } from '../../../../../../compartido/ui/ventana-modal/ventana-modal';
import { AuthService } from '../../../../../auth/aplicacion/auth.service';
import { TriajeApiService } from '../../../../../triaje/adaptadores/salida/http/triaje.api.service';
import { FichaAdmisionComponent } from '../componentes/ficha-admision/ficha-admision.component';
import { SisFuaReportComponent } from '../componentes/sis-fua-report/sis-fua-report.component';

const TIPO_PRIORIDAD_INFO = {
  1: {
    label: 'I. Emerg. o Gravedad',
    bg: '#fee2e2',
    text: '#b91c1c',
    dot: '#dc2626',
  },
  2: {
    label: 'II. Urgencia Mayor',
    bg: '#ffedd5',
    text: '#c2410c',
    dot: '#f97316',
  },
  3: {
    label: 'III. Urgencia Menor',
    bg: '#fef9c3',
    text: '#a16207',
    dot: '#eab308',
  },
  4: {
    label: 'IV. Patología Aguda Común',
    bg: '#d1fae5',
    text: '#047857',
    dot: '#10b981',
  },
  5: { label: 'Llegó Cadáver', bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
};
function campo(item, claves) {
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
function campoNum(item, claves) {
  const raw = campo(item, claves);
  return Number(raw) || 0;
}
let AdmisionesComponent = class AdmisionesComponent {
  maestrosApi = inject(MaestrosApiService);
  triajeApi = inject(TriajeApiService);
  cdr = inject(ChangeDetectorRef);
  authService = inject(AuthService);
  fecha = ((d) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`)(
    new Date(),
  );
  filtro = '';
  idDepartamento = '0';
  idEspecialidad = '0';
  idServicio = '0';
  departamentos = [];
  especialidades = [];
  servicios = [];
  items = [];
  cargando = false;
  error = '';
  buscar = false;
  modalAdmision = null;
  formAdmision = {
    nombreAcompanante: '',
    telefonoAcompanante: '',
    direccionPaciente: '',
    observacion: '',
    idMedico: '',
  };
  guardando = false;
  errorAdmision = '';
  medicosDisponibles = [];
  cargandoMedicos = false;
  errorMedicos = '';
  columnasTabla = [
    { campo: 'prioridadCustom', cabecera: 'Prioridad' },
    { campo: 'pacienteCustom', cabecera: 'Paciente' },
    { campo: 'servicioCustom', cabecera: 'Servicio', ancho: '200px' },
    { campo: 'tipoIngresoCustom', cabecera: 'Tipo ingreso' },
    { campo: 'fechaTriajeCustom', cabecera: 'Fecha triaje' },
    { campo: 'iafaCustom', cabecera: 'IAFA' },
    { campo: 'sexoCustom', cabecera: 'Sexo', alineacion: 'center' },
    { campo: 'accionCustom', cabecera: 'Acción', alineacion: 'right' },
  ];
  mensajeExito = '';
  modalFichaId = null;
  modalFuaId = null;
  ngOnInit() {
    this.cargarCatalogos();
  }
  async cargarCatalogos() {
    try {
      const [d, e, s] = await Promise.all([
        this.maestrosApi.getDepartamentos(),
        this.maestrosApi.getEspecialidades(),
        this.maestrosApi.getServicios(2),
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
        idDepartamento:
          this.idDepartamento !== '0' ? Number(this.idDepartamento) : undefined,
        idEspecialidad:
          this.idEspecialidad !== '0' ? Number(this.idEspecialidad) : undefined,
        idServicio:
          this.idServicio !== '0' ? Number(this.idServicio) : undefined,
      });
      this.items = Array.isArray(items) ? items : [];
      this.buscar = true;
    } catch (err) {
      this.error =
        err instanceof ApiRequestError
          ? err.message
          : 'No se pudo obtener la bandeja de admisiones.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }
  abrirModalAdmision(item) {
    this.modalAdmision = item;
    this.formAdmision = {
      nombreAcompanante: '',
      telefonoAcompanante: '',
      direccionPaciente:
        campo(item, ['Direccion', 'direccion', 'DireccionDomicilio']) || '',
      observacion: '',
      idMedico: '',
    };
    this.errorAdmision = '';
    this.cargarMedicos(item);
  }
  async cargarMedicos(item) {
    let idEspecialidad = campoNum(item, [
      'IdEspecialidad',
      'idEspecialidad',
      'Especialidad',
    ]);
    if (!idEspecialidad) idEspecialidad = Number(this.idEspecialidad) || 0;
    this.cargandoMedicos = true;
    this.errorMedicos = '';
    try {
      const medicos =
        await this.triajeApi.medicosPorEspecialidad(idEspecialidad);
      if (Array.isArray(medicos)) {
        this.medicosDisponibles = medicos.filter(
          (v, i, a) => a.findIndex((t) => t.idMedico === v.idMedico) === i,
        );
      } else {
        this.medicosDisponibles = [];
      }
      if (this.medicosDisponibles.length === 0) {
        this.errorMedicos =
          'No se encontraron médicos para la especialidad seleccionada.';
      }
    } catch (err) {
      this.medicosDisponibles = [];
      this.errorMedicos =
        err instanceof ApiRequestError
          ? err.message
          : 'No se pudieron cargar los médicos.';
    } finally {
      this.cargandoMedicos = false;
      this.cdr.detectChanges();
    }
  }
  cerrarModalAdmision() {
    this.modalAdmision = null;
    this.medicosDisponibles = [];
  }
  handleAdmisionExitosa(mensaje) {
    this.modalAdmision = null;
    this.mensajeExito = mensaje || 'Admisión registrada correctamente.';
    this.handleBuscar();
  }
  async admitir() {
    const item = this.modalAdmision;
    if (!item) return;
    const idTriaje = campoNum(item, ['IdTriaje', 'idTriaje', 'IDTriaje']);
    const idPacienteTriaje = campoNum(item, [
      'IdPacienteTriaje',
      'idPacienteTriaje',
      'IdpacienteTriaje',
      'IdPaciente',
      'idPaciente',
    ]);
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
    const payload = {
      idTriaje,
      idPacienteTriaje,
      idMedico: this.formAdmision.idMedico
        ? Number(this.formAdmision.idMedico)
        : undefined,
      nombreAcompanante:
        this.formAdmision.nombreAcompanante.trim() || undefined,
      telefonoAcompanante:
        this.formAdmision.telefonoAcompanante.trim() || undefined,
      direccionPaciente:
        this.formAdmision.direccionPaciente.trim() || undefined,
      observacion: this.formAdmision.observacion.trim() || undefined,
    };
    try {
      const resp = await this.triajeApi.crearAdmision(payload);
      this.handleAdmisionExitosa(
        resp?.resultado || 'Admisión registrada correctamente.',
      );
    } catch (err) {
      this.errorAdmision =
        err instanceof ApiRequestError
          ? err.message
          : 'No se pudo registrar la admisión.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }
  abrirFicha(item) {
    const id = campoNum(item, [
      'IdCuentaAtencion',
      'idCuentaAtencion',
      'NroCuenta',
      'nroCuenta',
      'Cuenta',
      'cuenta',
    ]);
    if (id) this.modalFichaId = id;
  }
  cerrarFicha() {
    this.modalFichaId = null;
  }
  abrirFua(item) {
    const id = campoNum(item, ['IdCuentaAtencion', 'idCuentaAtencion']);
    if (id) this.modalFuaId = id;
  }
  cerrarFua() {
    this.modalFuaId = null;
  }
  cerrarExito() {
    this.mensajeExito = '';
  }
  idCuentaAtencion(item) {
    return campoNum(item, [
      'IdCuentaAtencion',
      'idCuentaAtencion',
      'NroCuenta',
      'nroCuenta',
      'Cuenta',
      'cuenta',
    ]);
  }
  idTipoPrioridad(item) {
    return campoNum(item, [
      'IdTipoPrioridad',
      'idTiposGravedad',
      'IdTiposGravedad',
    ]);
  }
  prioridadInfo(item) {
    const id = this.idTipoPrioridad(item);
    return TIPO_PRIORIDAD_INFO[id] || null;
  }
  prioridadTexto(item) {
    return campo(item, [
      'Prioridad',
      'prioridad',
      'TipoPrioridad',
      'tipoPrioridad',
      'DescripcionPrioridad',
    ]);
  }
  nombrePaciente(item) {
    const completo = campo(item, [
      'Paciente',
      'paciente',
      'NombreCompleto',
      'nombreCompleto',
      'Nombre',
      'nombre',
    ]);
    if (completo) return completo;
    const partes = [
      campo(item, ['ApellidoPaterno', 'apellidoPaterno']),
      campo(item, ['ApellidoMaterno', 'apellidoMaterno']),
      campo(item, ['PrimerNombre', 'primerNombre']),
      campo(item, ['SegundoNombre', 'segundoNombre']),
    ].filter(Boolean);
    return partes.join(' ') || 'Paciente NN';
  }
  documento(item) {
    return campo(item, [
      'NroDocumento',
      'nroDocumento',
      'Documento',
      'documento',
    ]);
  }
  servicio(item) {
    return campo(item, ['Servicio', 'servicio', 'Descripcion', 'descripcion']);
  }
  tipoIngreso(item) {
    return campo(item, ['TipoIngreso', 'tipoIngreso']);
  }
  iafa(item) {
    return campo(item, ['IAFA', 'iafa', 'FuenteFinanciamiento']);
  }
  sexo(item) {
    return (
      campo(item, [
        'Sexo',
        'sexo',
        'TipoSexo',
        'tipoSexo',
        'IdTipoSexo',
        'idTipoSexo',
        'SexTypeID',
        'sexTypeId',
        'Genero',
        'genero',
        'IdGenero',
        'idGenero',
        'Sex',
        'sex',
        'SEXO',
        'GENERO',
      ])?.toString() || ''
    );
  }
  esSis(item) {
    return (
      campoNum(item, ['IdFuenteFinanciamiento', 'idFuenteFinanciamiento']) ===
        3 || this.iafa(item).toUpperCase().includes('SIS')
    );
  }
  formatFechaTriaje(item) {
    let raw = campo(item, [
      'fecha_Triaje',
      'FechaTriaje',
      'fechaTriaje',
      'FechaRegistro',
      'fechaRegistro',
    ]);
    if (!raw) return '—';
    if (raw.endsWith('Z')) raw = raw.slice(0, -1);
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '—';
    return (
      d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }) +
      ' ' +
      d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    );
  }
  sanitizar(texto) {
    return texto.replace(/[\p{Cc}\u200B-\u200F\uFEFF]/gu, '').trim();
  }
  soloDigitos(event) {
    if (event.key.length === 1 && !/\d/.test(event.key)) {
      event.preventDefault();
    }
  }
};
AdmisionesComponent = __decorate(
  [
    Component({
      selector: 'app-admisiones',
      standalone: true,
      imports: [
        FormsModule,
        CommonModule,
        VentanaModal,
        FichaAdmisionComponent,
        SisFuaReportComponent,
        ErrorMensajeComponent,
        TablaComponent,
        ColumnaTemplateDirective,
      ],
      templateUrl: './admisiones.component.html',
    }),
  ],
  AdmisionesComponent,
);

export { AdmisionesComponent };
