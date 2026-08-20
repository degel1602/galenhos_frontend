import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, inject, } from '@angular/core';
import { MaestrosApiService } from '../../../../../../../compartido/api/maestros.api.service';
import { ApiClientService } from '../../../../../../../compartido/api-client/api-client.service';
import { VentanaModal } from '../../../../../../../compartido/ui/ventana-modal/ventana-modal';
import { AuthService } from '../../../../../../auth/aplicacion/auth.service';
import { firmarTriajesMasivamente, generarPdfsTriajes, } from './firma-triaje-masivo.util';
let FirmaMasivaModal = class FirmaMasivaModal {
    ids = [];
    alCerrar = new EventEmitter();
    firmaCompletada = new EventEmitter();
    cdr = inject(ChangeDetectorRef);
    maestrosApi = inject(MaestrosApiService);
    apiClient = inject(ApiClientService);
    authService = inject(AuthService);
    fase = 'generando';
    progresoActual = 0;
    progresoTotal = 0;
    progresoId = 0;
    cancelado = false;
    resultados = [];
    errorGlobal = '';
    ngOnInit() {
        void this.ejecutar();
    }
    get documentoGenerados() {
        return this.resultados.filter((r) => r.ok).length;
    }
    get documentoFallidos() {
        return this.resultados.filter((r) => !r.ok).length;
    }
    cancelarOperacion() {
        this.cancelado = true;
    }
    apagarCancelacion() {
        this.cancelado = false;
    }
    conexion() {
        return {
            baseUrl: this.apiClient.getApiBaseUrl(),
            token: this.authService.getToken(),
        };
    }
    async ejecutar() {
        this.fase = 'generando';
        this.progresoActual = 0;
        this.progresoTotal = this.ids.length;
        this.apagarCancelacion();
        try {
            const institucion = (await this.maestrosApi.getDatosInstitucion());
            const generados = await generarPdfsTriajes(this.ids, institucion, this.conexion(), this.authService.username() ?? '', (actual, total, idTriaje) => {
                if (this.cancelado)
                    return false;
                this.progresoActual = actual;
                this.progresoTotal = total;
                this.progresoId = idTriaje;
                this.cdr.detectChanges();
                return true;
            });
            if (this.cancelado) {
                this.fase = 'cancelado';
                this.cdr.detectChanges();
                return;
            }
            this.fase = 'firmando';
            this.progresoActual = 1;
            this.progresoTotal = generados.filter((g) => g.doc).length;
            this.cdr.detectChanges();
            const resultados = await firmarTriajesMasivamente(generados, institucion, this.conexion(), this.authService.username() ?? '', (actual, _total, idTriaje) => {
                if (this.cancelado)
                    return false;
                this.progresoActual = actual;
                this.progresoId = idTriaje;
                this.cdr.detectChanges();
                return true;
            }, { cancelado: () => this.cancelado });
            if (this.cancelado) {
                this.fase = 'cancelado';
                this.cdr.detectChanges();
                return;
            }
            this.resultados = resultados;
            this.fase = 'resultados';
            this.cdr.detectChanges();
            const resumen = {
                firmados: this.documentoGenerados,
                fallidos: this.documentoFallidos,
            };
            if (resumen.firmados > 0) {
                this.firmaCompletada.emit(resumen);
                setTimeout(() => this.alCerrar.emit(), 1500);
            }
        }
        catch (e) {
            this.errorGlobal = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            this.fase = 'error';
            this.cdr.detectChanges();
        }
    }
};
__decorate([
    Input()
], FirmaMasivaModal.prototype, "ids", void 0);
__decorate([
    Output()
], FirmaMasivaModal.prototype, "alCerrar", void 0);
__decorate([
    Output()
], FirmaMasivaModal.prototype, "firmaCompletada", void 0);
FirmaMasivaModal = __decorate([
    Component({
        selector: 'app-firma-masiva-modal',
        standalone: true,
        imports: [CommonModule, VentanaModal],
        templateUrl: './firma-masiva-modal.html',
    })
], FirmaMasivaModal);
export { FirmaMasivaModal };
