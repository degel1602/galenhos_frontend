import { __decorate } from "tslib";
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
let PaginaConstruccionComponent = class PaginaConstruccionComponent {
    router = inject(Router);
    get ruta() {
        return this.router.url;
    }
    volver() {
        window.history.back();
    }
    irAlInicio() {
        this.router.navigate(['/dashboard']);
    }
};
PaginaConstruccionComponent = __decorate([
    Component({
        selector: 'app-pagina-construccion',
        standalone: true,
        templateUrl: './pagina-construccion.html',
    })
], PaginaConstruccionComponent);
export { PaginaConstruccionComponent };
