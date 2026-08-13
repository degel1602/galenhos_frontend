import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaestrosApiService } from '../../../../../../compartido/api/maestros.api.service';
import { TriajeApiService, CrearAdmisionPayload } from '../../../../../triaje/adaptadores/salida/http/triaje.api.service';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { ICatalogoNombre, IFilaBackend } from '../../../../../../compartido/tipos/api-tipos';
import { AuthService } from '../../../../../auth/aplicacion/auth.service';
import { VentanaModal } from '../../../../../../compartido/ui/ventana-modal/ventana-modal';

interface FormAdmision {
  nombreAcompanante: string;
  telefonoAcompanante: string;
  direccionPaciente: string;
  observacion: string;
}

// Lee un campo de un map devuelto por el SP probando varias claves (los SP
// resuelven los nombres de columna en runtime; variantes de mayúsculas).
function campo(item: IFilaBackend | null | undefined, claves: string[]): string {
  if (!item) return '';
  for (const k of claves) {
    const v = item[k];
    if (v !== undefined && v !== null && v !== '') {
      return typeof v === 'object' ? JSON.stringify(v) : String(v);
    }
  }
  return '';
}

@Component({
  selector: 'app-admisiones',
  standalone: true,
  imports: [FormsModule, CommonModule, VentanaModal],
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
  mensajeExito = '';

  modalAdmision: IFilaBackend | null = null;
  formAdmision: FormAdmision = { nombreAcompanante: '', telefonoAcompanante: '', direccionPaciente: '', observacion: '' };
  guardando = false;
  errorAdmision = '';

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
    } catch (err: unknown) {
      this.error = err instanceof ApiRequestError ? err.message : 'No se pudo obtener la bandeja de admisiones.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalAdmision(item: IFilaBackend) {
    this.modalAdmision = item;
    this.formAdmision = { nombreAcompanante: '', telefonoAcompanante: '', direccionPaciente: '', observacion: '' };
    this.errorAdmision = '';
  }

  cerrarModalAdmision() {
    this.modalAdmision = null;
  }

  async admitir() {
    const item = this.modalAdmision;
    const idTriaje = Number(campo(item, ['IdTriaje', 'idTriaje', 'IDTriaje']));
    const idPacienteTriaje = Number(campo(item, ['IdPacienteTriaje', 'idPacienteTriaje', 'IdPaciente', 'idPaciente']));
    if (!idTriaje || !idPacienteTriaje) {
      this.errorAdmision = 'El registro no tiene un id de triaje válido.';
      return;
    }
    if (this.formAdmision.telefonoAcompanante.trim() && !/^\d{6,15}$/.test(this.sanitizar(this.formAdmision.telefonoAcompanante))) {
      this.errorAdmision = 'El teléfono del acompañante debe tener entre 6 y 15 dígitos.';
      return;
    }
    this.guardando = true;
    this.errorAdmision = '';
    const payload: CrearAdmisionPayload = { idTriaje, idPacienteTriaje };
    const nombreAcompanante = this.sanitizar(this.formAdmision.nombreAcompanante);
    const telefonoAcompanante = this.sanitizar(this.formAdmision.telefonoAcompanante);
    const direccionPaciente = this.sanitizar(this.formAdmision.direccionPaciente);
    const observacion = this.sanitizar(this.formAdmision.observacion);
    if (nombreAcompanante) payload.nombreAcompanante = nombreAcompanante;
    if (telefonoAcompanante) payload.telefonoAcompanante = telefonoAcompanante;
    if (direccionPaciente) payload.direccionPaciente = direccionPaciente;
    if (observacion) payload.observacion = observacion;

    try {
      await this.triajeApi.crearAdmision(payload);
      this.modalAdmision = null;
      this.mensajeExito = 'Admisión registrada correctamente.';
      setTimeout(() => this.mensajeExito = '', 5000);
      this.handleBuscar();
    } catch (err: unknown) {
      this.errorAdmision = err instanceof ApiRequestError ? err.message : 'No se pudo registrar la admisión.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  // --- Ayudantes de render ---
  // Elimina caracteres de control/espaciado invisible y recorta los extremos.
  private sanitizar(texto: string): string {
    return texto.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '').trim();
  }

  soloDigitos(event: KeyboardEvent) {
    if (event.key.length === 1 && !/\d/.test(event.key)) {
      event.preventDefault();
    }
  }

  documento(item: IFilaBackend): string {
    return campo(item, ['NroDocumento', 'nroDocumento', 'Documento', 'documento']);
  }

  nombrePaciente(item: IFilaBackend): string {
    const completo = campo(item, ['NombreCompleto', 'nombreCompleto', 'Paciente', 'paciente', 'Nombre', 'nombre']);
    if (completo) return completo;
    const partes = [
      campo(item, ['ApellidoPaterno', 'apellidoPaterno', 'Paterno', 'paterno']),
      campo(item, ['ApellidoMaterno', 'apellidoMaterno', 'Materno', 'materno']),
      campo(item, ['PrimerNombre', 'primerNombre', 'Nombres', 'nombres']),
      campo(item, ['SegundoNombre', 'segundoNombre'])
    ].filter(Boolean);
    return partes.join(' ') || '—';
  }

  horaTriaje(item: IFilaBackend): string {
    const raw = campo(item, ['FechaTriaje', 'fechaTriaje', 'FechaRegistro', 'fechaRegistro', 'FechaIngreso', 'fechaIngreso', 'Fecha', 'fecha']);
    if (!raw) return '—';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  prioridad(item: IFilaBackend): string {
    return campo(item, ['Prioridad', 'prioridad', 'TipoPrioridad', 'tipoPrioridad', 'DescripcionPrioridad']);
  }

  estadoAdmision(item: IFilaBackend): string {
    const estado = campo(item, ['Estado', 'estado', 'IdEstado', 'idEstado', 'NombreEstado']);
    if (!estado) return 'pendiente';
    const s = estado.toLowerCase();
    return s.includes('1') || s.includes('pend') || s.includes('act') ? 'pendiente' : 'admitido';
  }

  departamentoNombre(item: IFilaBackend): string {
    return campo(item, ['Departamento', 'departamento', 'NombreDepartamento', 'Servicio']);
  }
}