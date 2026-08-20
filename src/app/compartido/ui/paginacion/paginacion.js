import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, } from '@angular/core';
let PaginacionComponent = class PaginacionComponent {
    page = 1;
    totalPages = 1;
    totalItems = 0;
    showTotal = true;
    pageChange = new EventEmitter();
    maxBotones = 5;
    paginasVisibles() {
        const actual = this.page;
        const total = Math.max(1, this.totalPages);
        const mitad = Math.floor(this.maxBotones / 2);
        let inicio = actual - mitad;
        let fin = actual + mitad;
        if (inicio < 1) {
            fin += 1 - inicio;
            inicio = 1;
        }
        if (fin > total) {
            inicio = Math.max(1, fin - this.maxBotones + 1);
            fin = total;
        }
        if (fin < this.maxBotones)
            fin = Math.min(total, this.maxBotones);
        const paginas = [];
        for (let i = inicio; i <= fin; i++)
            paginas.push(i);
        return paginas;
    }
    irAPagina(nuevaPagina) {
        const total = Math.max(1, this.totalPages);
        if (nuevaPagina < 1 || nuevaPagina > total || nuevaPagina === this.page)
            return;
        this.pageChange.emit(nuevaPagina);
    }
};
__decorate([
    Input()
], PaginacionComponent.prototype, "page", void 0);
__decorate([
    Input()
], PaginacionComponent.prototype, "totalPages", void 0);
__decorate([
    Input()
], PaginacionComponent.prototype, "totalItems", void 0);
__decorate([
    Input()
], PaginacionComponent.prototype, "showTotal", void 0);
__decorate([
    Output()
], PaginacionComponent.prototype, "pageChange", void 0);
PaginacionComponent = __decorate([
    Component({
        selector: 'app-paginacion',
        standalone: true,
        imports: [CommonModule],
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './paginacion.html',
    })
], PaginacionComponent);
export { PaginacionComponent };
