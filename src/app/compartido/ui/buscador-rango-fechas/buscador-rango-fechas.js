import { __decorate } from "tslib";
import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, } from '@angular/core';
import { FormsModule } from '@angular/forms';
let BuscadorRangoFechas = class BuscadorRangoFechas {
    placeholder = 'Buscar…';
    textoBoton = 'Buscar';
    cargando = false;
    set fechaDesdeInicial(v) {
        this.fechaDesde = v ?? '';
    }
    set fechaHastaInicial(v) {
        this.fechaHasta = v ?? '';
    }
    set filtroInicial(v) {
        this.filtro = v ?? '';
    }
    buscar = new EventEmitter();
    limpiarFiltros = new EventEmitter();
    filtro = '';
    fechaDesde = '';
    fechaHasta = '';
    emitirBusqueda() {
        if (this.fechaDesde &&
            this.fechaHasta &&
            this.fechaDesde > this.fechaHasta) {
            [this.fechaDesde, this.fechaHasta] = [this.fechaHasta, this.fechaDesde];
        }
        this.buscar.emit({
            filtro: this.filtro.trim(),
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
        });
    }
    limpiar() {
        this.filtro = '';
        this.fechaDesde = '';
        this.fechaHasta = '';
        this.limpiarFiltros.emit();
    }
};
__decorate([
    Input()
], BuscadorRangoFechas.prototype, "placeholder", void 0);
__decorate([
    Input()
], BuscadorRangoFechas.prototype, "textoBoton", void 0);
__decorate([
    Input()
], BuscadorRangoFechas.prototype, "cargando", void 0);
__decorate([
    Input()
], BuscadorRangoFechas.prototype, "fechaDesdeInicial", null);
__decorate([
    Input()
], BuscadorRangoFechas.prototype, "fechaHastaInicial", null);
__decorate([
    Input()
], BuscadorRangoFechas.prototype, "filtroInicial", null);
__decorate([
    Output()
], BuscadorRangoFechas.prototype, "buscar", void 0);
__decorate([
    Output()
], BuscadorRangoFechas.prototype, "limpiarFiltros", void 0);
BuscadorRangoFechas = __decorate([
    Component({
        selector: 'buscador-rango-fechas',
        standalone: true,
        imports: [FormsModule, NgIf],
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './buscador-rango-fechas.html',
    })
], BuscadorRangoFechas);
export { BuscadorRangoFechas };
