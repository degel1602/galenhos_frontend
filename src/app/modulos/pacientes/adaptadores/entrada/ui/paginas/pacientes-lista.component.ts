import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacientesApiService } from '../../../salida/http/pacientes.api.service';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { IPaciente } from '../../../../../../compartido/tipos/api-tipos';
import { RegistroPacienteModal } from '../../../../../../compartido/ui/registro-paciente/registro-paciente-modal';
import { AuthService } from '../../../../../auth/aplicacion/auth.service';

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
  imports: [FormsModule, RegistroPacienteModal],
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
  mensajeExito = '';

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
        // Modo búsqueda (limitado a 100 resultados por seguridad)
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
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  onPacienteRegistrado(nombre: string) {
    this.mensajeExito = `Paciente ${nombre} registrado correctamente.`;
    setTimeout(() => this.mensajeExito = '', 5000);
    this.buscarPacientes();
  }
}