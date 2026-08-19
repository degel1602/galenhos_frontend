import { __decorate } from "tslib";
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../modulos/auth/aplicacion/auth.service';
import { BarraLateral } from '../barra-lateral/barra-lateral';
import { BarraSuperior } from '../barra-superior/barra-superior';
let ContenedorPrincipal = class ContenedorPrincipal {
    authService = inject(AuthService);
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
ContenedorPrincipal = __decorate([
    Component({
        selector: 'contenedor-principal',
        imports: [RouterOutlet, BarraLateral, BarraSuperior],
        templateUrl: './contenedor-principal.html',
    })
], ContenedorPrincipal);
export { ContenedorPrincipal };
