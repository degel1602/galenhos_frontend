import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { TablaComponent, } from '../../../../../../compartido/componentes/tabla/tabla.component';
import { SisApiService, } from '../../../salida/http/sis.api.service';
export function formFiliacionVacio() {
    return {
        documentoNumero: '',
        paterno: '',
        materno: '',
        pNombre: '',
        oNombres: '',
        genero: '',
        fNacimiento: '',
        codigo: '',
    };
}
let SisComponent = class SisComponent {
    sisApi = inject(SisApiService);
    cdr = inject(ChangeDetectorRef);
    dni = '';
    consultando = false;
    afiliado = null;
    filasAfiliado = [];
    idCuentaAtencion = '';
    idAtencion = '';
    idEmpleado = '';
    operando = false;
    resultados = [];
    clavesResultados = [];
    columnasTabla = [];
    resultadoTitulo = '';
    fua = null;
    filasFua = [];
    filiacion = formFiliacionVacio();
    guardandoFiliacion = false;
    error = '';
    mensajeExito = '';
    async consultarAfiliado() {
        const dni = this.dni.trim();
        if (!/^\d{8}$/.test(dni)) {
            this.error = 'Ingrese un DNI de 8 dígitos.';
            return;
        }
        this.consultando = true;
        this.error = '';
        this.afiliado = null;
        this.filasAfiliado = [];
        try {
            const afiliado = await this.sisApi.consultarAfiliado(dni);
            this.afiliado = afiliado;
            this.filasAfiliado = Object.entries(afiliado)
                .filter(([, v]) => v !== null && v !== undefined && String(v) !== '')
                .map(([clave, valor]) => ({ clave, valor: String(valor) }));
        }
        catch (error) {
            this.error =
                error instanceof ApiRequestError
                    ? error.message
                    : 'No se pudo consultar el SIS.';
        }
        finally {
            this.consultando = false;
            this.cdr.detectChanges();
        }
    }
    async ejecutarListado(titulo, promesa) {
        this.operando = true;
        this.error = '';
        this.resultadoTitulo = '';
        this.resultados = [];
        this.clavesResultados = [];
        try {
            const items = await promesa;
            this.resultados = Array.isArray(items) ? items : [];
            this.resultadoTitulo = titulo;
            if (this.resultados.length > 0) {
                const claves = new Set();
                for (const fila of this.resultados) {
                    for (const k of Object.keys(fila))
                        claves.add(k);
                }
                this.clavesResultados = Array.from(claves);
                this.columnasTabla = this.clavesResultados.map((c) => ({
                    campo: c,
                    cabecera: c,
                }));
            }
        }
        catch (error) {
            this.error =
                error instanceof ApiRequestError
                    ? error.message
                    : 'No se pudo ejecutar la operación SIS.';
        }
        finally {
            this.operando = false;
            this.cdr.detectChanges();
        }
    }
    listarDiagnosticos() {
        const id = Number(this.idAtencion);
        if (!id) {
            this.error = 'Ingrese el id de atención.';
            return;
        }
        this.ejecutarListado('Diagnósticos de la atención', this.sisApi.listarDiagnosticos(id));
    }
    listarMedicamentos() {
        const id = Number(this.idCuentaAtencion);
        if (!id) {
            this.error = 'Ingrese el id de cuenta de atención.';
            return;
        }
        this.ejecutarListado('Medicamentos de la cuenta', this.sisApi.listarMedicamentos(id));
    }
    listarProcedimientos() {
        const id = Number(this.idCuentaAtencion);
        if (!id) {
            this.error = 'Ingrese el id de cuenta de atención.';
            return;
        }
        this.ejecutarListado('Procedimientos de la cuenta', this.sisApi.listarProcedimientos(id));
    }
    listarConsumo() {
        const id = Number(this.idCuentaAtencion);
        if (!id) {
            this.error = 'Ingrese el id de cuenta de atención.';
            return;
        }
        this.ejecutarListado('Consumo de la cuenta', this.sisApi.listarConsumo(id));
    }
    async forzarGuardadoFua() {
        const id = Number(this.idCuentaAtencion);
        if (!id) {
            this.error = 'Ingrese el id de cuenta de atención.';
            return;
        }
        this.operando = true;
        this.error = '';
        try {
            await this.sisApi.forzarGuardadoFua(id);
            this.mensajeExito = 'FUA guardado correctamente.';
            setTimeout(() => (this.mensajeExito = ''), 5000);
        }
        catch (error) {
            this.error =
                error instanceof ApiRequestError
                    ? error.message
                    : 'No se pudo guardar el FUA.';
        }
        finally {
            this.operando = false;
            this.cdr.detectChanges();
        }
    }
    async agregarFua() {
        const id = Number(this.idCuentaAtencion);
        const empleado = Number(this.idEmpleado);
        if (!id || !empleado) {
            this.error = 'Ingrese el id de cuenta de atención y el id de empleado.';
            return;
        }
        this.operando = true;
        this.error = '';
        try {
            const resp = await this.sisApi.agregarFua(id, empleado);
            this.mensajeExito = `FUA agregado (respuesta: ${resp.respuesta}).`;
            setTimeout(() => (this.mensajeExito = ''), 5000);
        }
        catch (error) {
            this.error =
                error instanceof ApiRequestError
                    ? error.message
                    : 'No se pudo agregar el FUA.';
        }
        finally {
            this.operando = false;
            this.cdr.detectChanges();
        }
    }
    async imprimirFua() {
        const id = Number(this.idCuentaAtencion);
        if (!id) {
            this.error = 'Ingrese el id de cuenta de atención.';
            return;
        }
        this.operando = true;
        this.error = '';
        this.fua = null;
        this.filasFua = [];
        try {
            const fua = await this.sisApi.fuaImprimir(id);
            this.fua = fua;
            this.filasFua = Object.entries(fua)
                .filter(([, valorFila]) => valorFila !== null &&
                valorFila !== undefined &&
                (typeof valorFila === 'object'
                    ? JSON.stringify(valorFila) !== '{}'
                    : String(valorFila) !== ''))
                .map(([clave, valorFila]) => ({
                clave,
                valor: typeof valorFila === 'object'
                    ? JSON.stringify(valorFila)
                    : String(valorFila),
            }));
        }
        catch (error) {
            this.error =
                error instanceof ApiRequestError
                    ? error.message
                    : 'No se pudo obtener el FUA para imprimir.';
        }
        finally {
            this.operando = false;
            this.cdr.detectChanges();
        }
    }
    async guardarFiliacion() {
        const f = this.filiacion;
        const documentoNumero = f.documentoNumero.trim();
        if (!documentoNumero) {
            this.error = 'Ingrese el número de documento del afiliado.';
            return;
        }
        const payload = { documentoNumero };
        if (f.paterno.trim())
            payload.paterno = f.paterno.trim();
        if (f.materno.trim())
            payload.materno = f.materno.trim();
        if (f.pNombre.trim())
            payload.pNombre = f.pNombre.trim();
        if (f.oNombres.trim())
            payload.oNombres = f.oNombres.trim();
        if (f.genero.trim())
            payload.genero = f.genero.trim();
        if (f.fNacimiento)
            payload.fNacimiento = new Date(`${f.fNacimiento}T00:00:00`).toISOString();
        if (f.codigo.trim())
            payload.codigo = f.codigo.trim();
        this.guardandoFiliacion = true;
        this.error = '';
        try {
            await this.sisApi.gestionarAfiliacion(payload);
            this.filiacion = formFiliacionVacio();
            this.mensajeExito = 'Afiliación SIS guardada correctamente.';
            setTimeout(() => (this.mensajeExito = ''), 5000);
        }
        catch (error) {
            this.error =
                error instanceof ApiRequestError
                    ? error.message
                    : 'No se pudo guardar la afiliación.';
        }
        finally {
            this.guardandoFiliacion = false;
            this.cdr.detectChanges();
        }
    }
    valorCelda(fila, clave) {
        const valorCeldaData = fila[clave];
        if (valorCeldaData === null || valorCeldaData === undefined)
            return '—';
        return typeof valorCeldaData === 'object'
            ? JSON.stringify(valorCeldaData)
            : String(valorCeldaData);
    }
};
SisComponent = __decorate([
    Component({
        selector: 'app-sis',
        standalone: true,
        imports: [CommonModule, FormsModule, TablaComponent],
        templateUrl: './sis.component.html',
    })
], SisComponent);
export { SisComponent };
