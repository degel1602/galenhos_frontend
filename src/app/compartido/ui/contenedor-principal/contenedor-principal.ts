import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BarraLateral } from '../barra-lateral/barra-lateral';
import { BarraSuperior } from '../barra-superior/barra-superior';
import { AuthService } from '../../../modulos/auth/aplicacion/auth.service';

@Component({
  selector: 'contenedor-principal',
  imports: [RouterOutlet, BarraLateral, BarraSuperior],
  templateUrl: './contenedor-principal.html'
})
export class ContenedorPrincipal {
  authService = inject(AuthService);
  private router = inject(Router);

  tituloActual: string = '';
  isSidebarOpen: boolean = true;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.actualizarTitulo();
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private actualizarTitulo() {
    const route = this.router.routerState.snapshot.root;
    let currentRoute = route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    
    // Obtener el título de los datos de la ruta, o usar uno por defecto
    this.tituloActual = currentRoute.data['title'] || 'Galenos Pro';
  }
}
