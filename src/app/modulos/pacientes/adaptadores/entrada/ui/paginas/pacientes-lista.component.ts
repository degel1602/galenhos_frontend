import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacientesApiService } from '../../../salida/http/pacientes.api.service';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { IPaciente } from '../../../../../../compartido/tipos/api-tipos';
import { RegistroPacienteModal } from '../../../../../../compartido/ui/registro-paciente/registro-paciente-modal';
import { PaginacionComponent } from '../../../../../../compartido/ui/paginacion/paginacion';
import { AuthService } from '../../../../../auth/aplicacion/auth.service';
import { TablaComponent, ColumnaTabla } from '../../../../../../compartido/componentes/tabla/tabla.component';
import { ColumnaTemplateDirective } from '../../../../../../compartido/componentes/tabla/columna-template.directive';

interface Filtros {
  documento: string;
  historiaClinica: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
}

@Component({
  selector: 'app-pacientes-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RegistroPacienteModal, PaginacionComponent, TablaComponent, ColumnaTemplateDirective],
  templateUrl: './pacientes-lista.component.html'
})
export class PacientesListaComponent implements OnInit {
  private readonly pacientesApi = inject(PacientesApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly authService = inject(AuthService);

  filtros: Filtros = {
    documento: '',
    historiaClinica: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombres: ''
  };

  pacientes: IPaciente[] = [];
  cargando = false;
  error = '';
  modalAbierto = false;
  pacienteEditando: IPaciente | null = null;
  mensajeExito = '';

  columnasTabla: ColumnaTabla[] = [
    { campo: 'documentoCustom', cabecera: 'Documento' },
    { campo: 'hcCustom', cabecera: 'H.C.' },
    { campo: 'pacienteCustom', cabecera: 'Paciente' },
    { campo: 'sexoCustom', cabecera: 'Sexo', alineacion: 'center' },
    { campo: 'fNacimientoCustom', cabecera: 'F. Nacimiento' },
    { campo: 'accionesCustom', cabecera: 'Acciones', alineacion: 'right' }
  ];

  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  totalRegistros = 0;

  ngOnInit() {
    this.buscarPacientes();
  }

  async buscarPacientes(resetPage = true) {
    if (resetPage) this.paginaActual = 1;

    this.cargando = true;
    this.error = '';

    const doc = this.filtros.documento?.trim();
    const hc = this.filtros.historiaClinica?.trim();
    const pat = this.filtros.apellidoPaterno?.trim();
    const mat = this.filtros.apellidoMaterno?.trim();
    const nom = this.filtros.nombres?.trim();

    const hasFiltros = !!(doc || hc || pat || mat || nom);

    if (hasFiltros && !this.validarFiltros(doc, hc, pat, mat, nom)) {
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      if (hasFiltros) {
        await this.realizarBusquedaAvanzada(doc, hc, pat, mat, nom);
      } else {
        await this.cargarListadoPaginado();
      }
    } catch (err: unknown) {
      this.manejarErrorBusqueda(err);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  private validarFiltros(doc: string, hc: string, pat: string, mat: string, nom: string): boolean {
    if (!doc && !hc) {
      if ((pat && pat.length < 3) || (mat && mat.length < 3) || (nom && nom.length < 3)) {
        this.error = 'Para búsquedas por nombre o apellido, ingrese al menos 3 caracteres.';
        return false;
      }
    } else if (doc && doc.length < 4) {
      this.error = 'El documento debe tener al menos 4 caracteres.';
      return false;
    }
    return true;
  }

  private async realizarBusquedaAvanzada(doc: string, hc: string, pat: string, mat: string, nom: string) {
    const query = new URLSearchParams();
    if (doc) query.append('documento', doc);
    if (hc) query.append('hc', hc);
    if (pat) query.append('paterno', pat);
    if (mat) query.append('materno', mat);
    if (nom) query.append('nombres', nom);
    
    const res = await this.pacientesApi.buscar(query.toString());
    this.pacientes = res || [];
    this.paginaActual = 1;
    this.totalPaginas = 1;
    this.totalRegistros = this.pacientes.length;
  }

  private async cargarListadoPaginado() {
    const query = new URLSearchParams();
    query.append('page', this.paginaActual.toString());
    query.append('pageSize', '20');

    const res = await this.pacientesApi.listar(query.toString());
    this.pacientes = res.items || [];
    this.paginaActual = res.page;
    this.totalPaginas = res.totalPages;
    this.totalRegistros = res.totalItems;
  }

  private manejarErrorBusqueda(err: unknown) {
    if (err instanceof ApiRequestError) {
      this.error = err.message;
    } else {
      this.error = 'Ocurrió un error al buscar pacientes.';
    }
  }

  limpiarFiltros() {
    this.filtros = {
      documento: '',
      historiaClinica: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombres: ''
    };
    this.buscarPacientes();
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.buscarPacientes(false);
    }
  }

  abrirNuevoPaciente() {
    this.pacienteEditando = null;
    this.modalAbierto = true;
  }

  abrirEdicion(paciente: IPaciente) {
    this.pacienteEditando = paciente;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.pacienteEditando = null;
  }

  onPacienteRegistrado(nombre: string) {
    this.mensajeExito = `Paciente ${nombre} registrado correctamente.`;
    setTimeout(() => this.mensajeExito = '', 5000);
    this.buscarPacientes();
  }

  onPacienteActualizado(nombre: string) {
    this.mensajeExito = `Paciente ${nombre} actualizado correctamente.`;
    setTimeout(() => this.mensajeExito = '', 5000);
    this.buscarPacientes();
  }

  async eliminarPaciente(paciente: IPaciente) {
    const nombre = `${paciente.paternalSurname} ${paciente.maternalSurname}, ${paciente.firstName}`.trim();
    const confirmar = window.confirm(`¿Eliminar al paciente ${nombre}?\nEsta acción no se puede deshacer.`);
    if (!confirmar) return;
    this.error = '';
    try {
      await this.pacientesApi.eliminar(paciente.patientId);
      this.mensajeExito = `Paciente ${nombre} eliminado correctamente.`;
      setTimeout(() => this.mensajeExito = '', 5000);
      this.buscarPacientes();
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        this.error = err.message;
      } else {
        this.error = 'No se pudo eliminar el paciente.';
      }
    } finally {
      this.cdr.detectChanges();
    }
  }
}