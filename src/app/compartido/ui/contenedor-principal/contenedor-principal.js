import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { __decorate } from 'tslib';
import { AuthService } from '../../../modulos/auth/aplicacion/auth.service';
import { BarraLateral } from '../barra-lateral/barra-lateral';
import { BarraSuperior } from '../barra-superior/barra-superior';
import { BienvenidaService } from '../credencial-bienvenida/bienvenida.service';
import { CredencialBienvenidaComponent } from '../credencial-bienvenida/credencial-bienvenida';

let ContenedorPrincipal = class ContenedorPrincipal {
  authService = inject(AuthService);
  bienvenidaService = inject(BienvenidaService);
  router = inject(Router);
  tituloActual = '';
  isSidebarOpen = true;
  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.actualizarTitulo();
      });
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  actualizarTitulo() {
    const route = this.router.routerState.snapshot.root;
    let currentRoute = route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const data = currentRoute.data;
    this.tituloActual = data.title || 'Galenos Pro';
  }
};
ContenedorPrincipal = __decorate(
  [
    Component({
      selector: 'contenedor-principal',
      imports: [
        RouterOutlet,
        BarraLateral,
        BarraSuperior,
        CredencialBienvenidaComponent,
      ],
      templateUrl: './contenedor-principal.html',
    }),
  ],
  ContenedorPrincipal,
);

export { ContenedorPrincipal };
