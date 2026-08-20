import { __decorate } from "tslib";
import { Injectable, signal } from '@angular/core';
let BienvenidaService = class BienvenidaService {
    mostrarOverlay = signal(false);
    activar() {
        this.mostrarOverlay.set(true);
    }
    desactivar() {
        this.mostrarOverlay.set(false);
    }
};
BienvenidaService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], BienvenidaService);
export { BienvenidaService };
