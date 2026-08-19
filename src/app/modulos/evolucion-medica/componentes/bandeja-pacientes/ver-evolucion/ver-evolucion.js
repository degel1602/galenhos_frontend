import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
let VerEvolucionComponent = class VerEvolucionComponent {
    detalle;
    get cabecera() {
        return this.detalle?.cabecera ?? {};
    }
    get motivos() {
        const m = this.detalle?.motivo ?? {};
        return [
            { etiqueta: 'Motivo de consulta', activo: !!m.motivoConsulta },
            { etiqueta: 'Seguimiento', activo: !!m.seguimiento },
            { etiqueta: 'Control', activo: !!m.control },
            { etiqueta: 'Reevaluación', activo: !!m.reevaluacion },
            { etiqueta: 'Postoperatorio', activo: !!m.postoperatorio },
            { etiqueta: 'Interconsulta', activo: !!m.interconsulta },
            { etiqueta: 'Emergencia', activo: !!m.emergencia },
        ].filter((x) => x.activo);
    }
    get motivoDetalle() {
        return this.detalle?.motivo?.detalle ?? '';
    }
    get sintomas() {
        return Array.isArray(this.detalle?.sintomas) ? this.detalle.sintomas : [];
    }
    get subjetivo() {
        return this.detalle?.subjetivo ?? {};
    }
    get subjetivoMarcados() {
        const s = this.subjetivo;
        const etiquetas = [
            ['Dolor', !!s.dolor],
            ['Fiebre', !!s.fiebre],
            ['Tos', !!s.tos],
            ['Náuseas', !!s.nauseas],
            ['Vómitos', !!s.vomitos],
            ['Mareos', !!s.mareos],
            ['Disnea', !!s.disnea],
        ];
        return etiquetas.filter(([, v]) => v).map(([e]) => e);
    }
    get signosVitales() {
        const sv = this.detalle?.signosVitales ?? {};
        const items = [
            ['P/A', sv.presionArterial],
            ['FC', sv.frecuenciaCardiaca],
            ['FR', sv.frecuenciaRespiratoria],
            ['T°', sv.temperatura],
            ['SpO₂', sv.saturacionOxigeno],
            ['Peso', sv.peso],
            ['Talla', sv.talla],
            ['IMC', sv.imc],
            ['Glucemia', sv.glucemia],
        ];
        return items
            .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== '—')
            .map(([e, v]) => ({ etiqueta: e, valor: String(v) }));
    }
    get examenFisico() {
        const arr = this.detalle?.examenFisico;
        return Array.isArray(arr) ? arr : [];
    }
    get diagnosticos() {
        const arr = this.detalle?.diagnosticos;
        return Array.isArray(arr)
            ? arr.filter((d) => d?.descripcion || d?.cie10)
            : [];
    }
    get evaluacion() {
        return this.detalle?.evaluacion ?? {};
    }
    get farmacologico() {
        const arr = this.detalle?.plan?.farmacologico;
        return Array.isArray(arr)
            ? arr.filter((m) => m?.medicamento || m?.dosis)
            : [];
    }
    get procedimientosIndicados() {
        const p = this.detalle?.plan?.procedimientosIndicados ?? {};
        const items = [
            ['Curaciones', !!p.curaciones],
            ['Suturas', !!p.suturas],
            ['Catéter', !!p.cateter],
            ['Intubación', !!p.intubacion],
        ];
        const activos = items.filter(([, v]) => v).map(([e]) => e);
        if (p.otro)
            activos.push(String(p.otro));
        return activos;
    }
    get solicitudExamenes() {
        const e = this.detalle?.plan?.solicitudExamenes ?? {};
        const items = [
            ['Laboratorio', e.laboratorio],
            ['Imágenes', e.imagenes],
            ['Otros', e.otros],
        ];
        return items
            .filter(([, v]) => v && String(v).trim())
            .map(([et, v]) => ({ etiqueta: et, valor: String(v) }));
    }
    get interconsultasSolicitadas() {
        const i = this.detalle?.plan?.interconsultas ?? {};
        const items = [
            ['Cardiología', !!i.cardiologia],
            ['Cirugía', !!i.cirugia],
            ['Nutrición', !!i.nutricion],
            ['Psicología', !!i.psicologia],
        ];
        const activos = items.filter(([, v]) => v).map(([e]) => e);
        if (i.otra)
            activos.push(String(i.otra));
        return activos;
    }
    get indicacionesGenerales() {
        const ig = this.detalle?.plan?.indicacionesGenerales ?? {};
        const items = [
            ['Dieta', ig.dieta],
            ['Reposo', ig.reposo],
            ['Hidratación', ig.hidratacion],
            ['Oxígeno', ig.oxigeno],
            ['Restricciones', ig.restricciones],
        ];
        return items
            .filter(([, v]) => v && String(v).trim())
            .map(([e, v]) => ({ etiqueta: e, valor: String(v) }));
    }
    get evolucionLibre() {
        return this.detalle?.evolucionLibre ?? '';
    }
    get ordenesMedicas() {
        return this.detalle?.ordenesMedicas ?? {};
    }
    get ordenesTexto() {
        const o = this.ordenesMedicas;
        if (o.orden && o.detalle)
            return `${o.orden}: ${o.detalle}`;
        if (o.detalle)
            return String(o.detalle);
        return '';
    }
    get adjuntos() {
        const arr = this.detalle?.adjuntos;
        return Array.isArray(arr) ? arr : [];
    }
    get firmaDigital() {
        return this.detalle?.firmaDigital ?? '';
    }
};
__decorate([
    Input({ required: true })
], VerEvolucionComponent.prototype, "detalle", void 0);
VerEvolucionComponent = __decorate([
    Component({
        selector: 'app-ver-evolucion',
        standalone: true,
        imports: [CommonModule],
        templateUrl: './ver-evolucion.html',
    })
], VerEvolucionComponent);
export { VerEvolucionComponent };
