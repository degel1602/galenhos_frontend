import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { generarHtmlReporteTriaje } from './reporte-triaje.impresion';
import { ChangeDetectorRef, Component, EventEmitter, Input, inject, Output, } from '@angular/core';
import { MaestrosApiService } from '../../../../../../../compartido/api/maestros.api.service';
import { VentanaModal } from '../../../../../../../compartido/ui/ventana-modal/ventana-modal';
import { imprimirHtml } from '../../../../../../../compartido/utilidades/print.util';
import { TriajeApiService } from '../../../../salida/http/triaje.api.service';
function _v(x) {
    if (x === null || x === undefined || x === '')
        return '—';
    return String(x);
}
export function formatFecha(iso) {
    if (!iso)
        return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toLocaleDateString('es-PE');
}
export function decodificarBase64Reporte(valor) {
    if (!valor)
        return '—';
    try {
        if (/^[A-Za-z0-9+/]+={0,2}$/.test(valor))
            return atob(valor);
    }
    catch { }
    return valor;
}
let ReporteTriajeComponent = class ReporteTriajeComponent {
    idTriaje;
    alCerrar = new EventEmitter();
    triajeApi = inject(TriajeApiService);
    maestrosApi = inject(MaestrosApiService);
    cdr = inject(ChangeDetectorRef);
    cabecera = null;
    institucion = null;
    cargando = true;
    error = '';
    fechaImp = new Date().toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    ngOnInit() {
        this.cargar();
    }
    async cargar() {
        try {
            const [reporte, inst] = await Promise.all([
                this.triajeApi.obtenerReporte({ id: this.idTriaje }),
                this.maestrosApi.getDatosInstitucion(),
            ]);
            const arr = Array.isArray(reporte) ? reporte : [];
            if (arr.length === 0) {
                this.error = 'No se encontró el reporte del triaje.';
            }
            else {
                this.cabecera = arr[0];
            }
            this.institucion = inst;
        }
        catch {
            this.error = 'No se pudo cargar el reporte del triaje.';
        }
        finally {
            this.cargando = false;
            this.cdr.detectChanges();
        }
    }
    campo(...claves) {
        if (!this.cabecera)
            return '—';
        for (const k of claves) {
            const val = this.cabecera[k];
            if (val !== undefined && val !== null && val !== '')
                return String(val);
        }
        return '—';
    }
    campoBase64(...claves) {
        if (!this.cabecera)
            return '—';
        for (const k of claves) {
            const val = this.cabecera[k];
            if (val !== undefined && val !== null && val !== '')
                return decodificarBase64Reporte(String(val));
        }
        return '—';
    }
    inst(campo) {
        if (!this.institucion)
            return '—';
        const val = this.institucion[campo];
        return val !== undefined && val !== null && val !== ''
            ? String(val)
            : '—';
    }
    logoMinsa() {
        if (!this.institucion)
            return '';
        const val = this.institucion.logoMinsa;
        return val && typeof val === 'string' ? val : '';
    }
    imprimirReporte() {
        if (!this.cabecera)
            return;
        const tmpl = generarHtmlReporteTriaje(this.cabecera, this.institucion, this.logoMinsa(), String(this.idTriaje), this.fechaImp);
        imprimirHtml(tmpl);
    }
};
__decorate([
    Input()
], ReporteTriajeComponent.prototype, "idTriaje", void 0);
__decorate([
    Output()
], ReporteTriajeComponent.prototype, "alCerrar", void 0);
ReporteTriajeComponent = __decorate([
    Component({
        selector: 'app-reporte-triaje',
        standalone: true,
        imports: [CommonModule, VentanaModal],
        templateUrl: './reporte-triaje.component.html',
    })
], ReporteTriajeComponent);
export { ReporteTriajeComponent };
