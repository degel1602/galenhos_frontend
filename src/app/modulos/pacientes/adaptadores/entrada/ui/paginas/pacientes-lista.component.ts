import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacientesApiService } from '../../../salida/http/pacientes.api.service';
import { VentanaModal } from '../../../../../../compartido/ui/ventana-modal/ventana-modal';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';

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
  imports: [FormsModule, VentanaModal],
  templateUrl: './pacientes-lista.component.html'
})
export class PacientesListaComponent implements OnInit {
  private pacientesApi = inject(PacientesApiService);

  filtros: Filtros = {
    documento: '',
    historiaClinica: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombres: ''
  };

  pacientes: any[] = [];
  cargando = false;
  error = '';
  modalAbierto = false;
  
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

    const query = new URLSearchParams();
    if (this.filtros.documento) query.append('nroDocumento', this.filtros.documento);
    if (this.filtros.historiaClinica) query.append('nroHistoriaClinica', this.filtros.historiaClinica);
    if (this.filtros.apellidoPaterno) query.append('apellidoPaterno', this.filtros.apellidoPaterno);
    if (this.filtros.apellidoMaterno) query.append('apellidoMaterno', this.filtros.apellidoMaterno);
    if (this.filtros.nombres) query.append('nombres', this.filtros.nombres);
    
    query.append('page', this.paginaActual.toString());
    query.append('pageSize', '20');

    try {
      const res = await this.pacientesApi.buscar(query.toString());
      this.pacientes = res.items || [];
      this.paginaActual = res.page;
      this.totalPaginas = res.totalPages;
      this.totalRegistros = res.totalItems;
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        this.error = err.message;
      } else {
        this.error = 'Ocurrió un error al buscar pacientes.';
      }
    } finally {
      this.cargando = false;
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
}
