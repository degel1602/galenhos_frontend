import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  type OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiRequestError } from '../../../../../../../compartido/api-client/api-client.service';
import type { IPaciente } from '../../../../../../../compartido/tipos/api-tipos';
import { BotonesFiltroComponent } from '../../../../../../../compartido/ui/botones-filtro/botones-filtro';
import { FiltrosGlobal } from '../../../../../../../compartido/ui/filtros-global/filtros-global';
import { ModalGlobalService } from '../../../../../../../compartido/ui/modal-global/modal-global.service';
import { PaginacionComponent } from '../../../../../../../compartido/ui/paginacion/paginacion';
import { RegistroPacienteModal } from '../../../../../../../compartido/ui/registro-paciente/registro-paciente-modal';
import {
  type ColumnaTabla,
  TablaGlobal,
} from '../../../../../../../compartido/ui/tabla-global/tabla-global';
import { AuthService } from '../../../../../../auth/aplicacion/auth.service';
import { PacientesApiService } from '../../../../salida/http/pacientes.api.service';

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
  imports: [
    CommonModule,
    FormsModule,
    RegistroPacienteModal,
    PaginacionComponent,
    TablaGlobal,
    FiltrosGlobal,
    BotonesFiltroComponent,
  ],
  templateUrl: './pacientes-lista.component.html',
})
export class PacientesListaComponent implements OnInit {
  private readonly pacientesApi = inject(PacientesApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly modalGlobal = inject(ModalGlobalService);
  readonly authService = inject(AuthService);

  filtros: Filtros = {
    documento: '',
    historiaClinica: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombres: '',
  };

  pacientes: IPaciente[] = [];
  cargando = false;
  error = '';
  modalAbierto = false;
  pacienteEditando: IPaciente | null = null;
  mensajeExito = '';

  columnasTabla: ColumnaTabla[] = [
    { campo: 'documentoCustom', nombre: 'Documento' },
    { campo: 'hcCustom', nombre: 'H.C.' },
    { campo: 'pacienteCustom', nombre: 'Paciente' },
    { campo: 'sexoCustom', nombre: 'Sexo', alineacion: 'center' },
    { campo: 'fNacimientoCustom', nombre: 'F. Nacimiento' },
    { campo: 'accionesCustom', nombre: 'Acciones', alineacion: 'center' },
  ];

  paginaActual = 1;
  totalPaginas = 1;
  totalRegistros = 0;

  ngOnInit() {
    this.buscarPacientes();
  }

  calcularEdad(fechaNacimiento: string | undefined): string {
    if (!fechaNacimiento) return '—';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} años`;
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
    } catch (error: unknown) {
      this.manejarErrorBusqueda(error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  private validarFiltros(
    doc: string,
    hc: string,
    pat: string,
    mat: string,
    nom: string,
  ): boolean {
    if (!doc && !hc) {
      if (
        (pat && pat.length < 3) ||
        (mat && mat.length < 3) ||
        (nom && nom.length < 3)
      ) {
        this.error =
          'Para búsquedas por nombre o apellido, ingrese al menos 3 caracteres.';
        return false;
      }
    } else if (doc && doc.length < 4) {
      this.error = 'El documento debe tener al menos 4 caracteres.';
      return false;
    }
    return true;
  }

  private async realizarBusquedaAvanzada(
    doc: string,
    hc: string,
    pat: string,
    mat: string,
    nom: string,
  ) {
    const query = new URLSearchParams();
    query.append('documento', doc);
    query.append('hc', hc);
    query.append('paterno', pat);
    query.append('materno', mat);
    query.append('nombres', nom);

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

  private manejarErrorBusqueda(error: unknown) {
    if (error instanceof ApiRequestError) {
      this.error = error.message;
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
      nombres: '',
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
    setTimeout(() => (this.mensajeExito = ''), 5000);
    this.buscarPacientes();
  }

  onPacienteActualizado(nombre: string) {
    this.mensajeExito = `Paciente ${nombre} actualizado correctamente.`;
    setTimeout(() => (this.mensajeExito = ''), 5000);
    this.buscarPacientes();
  }

  async eliminarPaciente(paciente: IPaciente) {
    const nombre =
      `${paciente.paternalSurname} ${paciente.maternalSurname}, ${paciente.firstName}`.trim();
    const confirmar = await this.modalGlobal.confirmar(
      `¿Está seguro que desea eliminar al paciente ${nombre}?\nEsta acción no se puede deshacer.`,
      'Eliminar paciente',
      'Sí, eliminar',
    );
    if (!confirmar) return;
    this.error = '';
    try {
      await this.pacientesApi.eliminar(paciente.patientId);
      this.mensajeExito = `Paciente ${nombre} eliminado correctamente.`;
      setTimeout(() => (this.mensajeExito = ''), 5000);
      this.buscarPacientes();
    } catch (error: unknown) {
      if (error instanceof ApiRequestError) {
        this.error = error.message;
      } else {
        this.error = 'No se pudo eliminar el paciente.';
      }
    } finally {
      this.cdr.detectChanges();
    }
  }
}
