import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaestrosApiService } from '../../../../../../compartido/api/maestros.api.service';
import { AuthService } from '../../../../../auth/aplicacion/auth.service';

interface CatalogoItem {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-admisiones',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admisiones.component.html'
})
export class AdmisionesComponent implements OnInit {
  private readonly maestrosApi = inject(MaestrosApiService);
  public readonly authService = inject(AuthService);

  fecha = new Date().toISOString().slice(0, 10);
  filtro = '';
  idDepartamento = '0';
  idEspecialidad = '0';
  idServicio = '0';

  departamentos: CatalogoItem[] = [];
  especialidades: CatalogoItem[] = [];
  servicios: CatalogoItem[] = [];

  items: unknown[] = [];
  cargando = false;
  error = '';
  buscar = false;
  mensajeExito = '';

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
    this.items = [];
    this.mensajeExito = '';
    setTimeout(() => {
      this.cargando = false;
      this.buscar = true;
    }, 500);
  }
}
