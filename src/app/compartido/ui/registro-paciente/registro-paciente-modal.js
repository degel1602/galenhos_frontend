import { __decorate } from "tslib";
import { ChangeDetectorRef, Component, EventEmitter, Input, inject, Output, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VentanaModal } from '../ventana-modal/ventana-modal';
import { normalizarNombre } from './registro-paciente.interfaces';
import { RegistroPacienteService } from './registro-paciente.service';
let RegistroPacienteModal = class RegistroPacienteModal {
    abierto = false;
    modo = 'paciente';
    pacienteId = null;
    titulo = 'Registrar Nuevo Paciente';
    subtitulo = 'Complete los datos del paciente';
    alCerrar = new EventEmitter();
    registrado = new EventEmitter();
    actualizado = new EventEmitter();
    srv = inject(RegistroPacienteService);
    cdr = inject(ChangeDetectorRef);
    normalizarNombre = normalizarNombre;
    async ngOnChanges(cambios) {
        if (cambios.abierto?.currentValue === true) {
            this.srv.limpiarEstado();
            this.srv.cargarCatalogos();
            if (this.pacienteId) {
                await this.srv.cargarPaciente(this.pacienteId);
                this.cdr.detectChanges();
            }
        }
    }
    cerrar() {
        this.alCerrar.emit();
    }
    soloDigitos(event) {
        if (event.key.length === 1 && !/\d/.test(event.key)) {
            event.preventDefault();
        }
    }
    async consultarReniec() {
        await this.srv.consultarReniec();
    }
    async guardar() {
        const nombre = await this.srv.guardar(this.pacienteId, this.modo);
        if (nombre) {
            if (this.pacienteId) {
                this.actualizado.emit(nombre);
            }
            else {
                this.registrado.emit(nombre);
            }
            this.cerrar();
        }
    }
    onCambioDepartamento(tipo) {
        this.srv.onCambioDepartamento(tipo);
    }
    onCambioProvincia(tipo) {
        this.srv.onCambioProvincia(tipo);
    }
    onCambioDistrito(tipo) {
        this.srv.onCambioDistrito(tipo);
    }
};
__decorate([
    Input()
], RegistroPacienteModal.prototype, "abierto", void 0);
__decorate([
    Input()
], RegistroPacienteModal.prototype, "modo", void 0);
__decorate([
    Input()
], RegistroPacienteModal.prototype, "pacienteId", void 0);
__decorate([
    Input()
], RegistroPacienteModal.prototype, "titulo", void 0);
__decorate([
    Input()
], RegistroPacienteModal.prototype, "subtitulo", void 0);
__decorate([
    Output()
], RegistroPacienteModal.prototype, "alCerrar", void 0);
__decorate([
    Output()
], RegistroPacienteModal.prototype, "registrado", void 0);
__decorate([
    Output()
], RegistroPacienteModal.prototype, "actualizado", void 0);
RegistroPacienteModal = __decorate([
    Component({
        selector: 'registro-paciente-modal',
        standalone: true,
        imports: [FormsModule, VentanaModal],
        providers: [RegistroPacienteService],
        templateUrl: './registro-paciente-modal.html',
    })
], RegistroPacienteModal);
export { RegistroPacienteModal };
