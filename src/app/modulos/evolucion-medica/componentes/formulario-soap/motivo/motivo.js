import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, } from '@angular/forms';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';
import { AuthService } from '../../../../auth/aplicacion/auth.service';
import { EvolucionService } from '../../../servicios/evolucion.service';
import { MotivoService, } from '../../../servicios/motivo.service';
let MotivoComponent = class MotivoComponent {
    fb = inject(FormBuilder);
    motivoService = inject(MotivoService);
    evolucionService = inject(EvolucionService);
    authService = inject(AuthService);
    motivoForm = this.fb.group({
        tipo: ['', Validators.required],
        descripcion: ['', [Validators.required, Validators.minLength(5)]],
    });
    motivos = signal([]);
    isLoading = signal(false);
    isSubmitting = signal(false);
    errorMessage = signal('');
    tiposMotivo = [
        { valor: 'Consulta', etiqueta: 'Consulta general', icono: 'usuario' },
        { valor: 'Seguimiento', etiqueta: 'Seguimiento', icono: 'pulso' },
        { valor: 'Control', etiqueta: 'Control', icono: 'check' },
        { valor: 'Reevaluación', etiqueta: 'Reevaluación', icono: 'refresh' },
        { valor: 'Postoperatorio', etiqueta: 'Postoperatorio', icono: 'cruz' },
        { valor: 'Interconsulta', etiqueta: 'Interconsulta', icono: 'mensaje' },
        { valor: 'Emergencia', etiqueta: 'Emergencia', icono: 'campana' },
    ];
    ngOnInit() {
        this.cargarMotivos();
    }
    async cargarMotivos() {
        const paciente = this.evolucionService.activePatient();
        if (!paciente?.idRegAtencion)
            return;
        this.isLoading.set(true);
        this.errorMessage.set('');
        try {
            const datos = await this.motivoService.listarMotivos(paciente.idRegAtencion);
            this.motivos.set(datos);
        }
        catch {
            this.errorMessage.set('No se pudieron cargar los motivos previos.');
        }
        finally {
            this.isLoading.set(false);
        }
    }
    async registrarMotivo() {
        if (this.motivoForm.invalid)
            return;
        const paciente = this.evolucionService.activePatient();
        if (!paciente?.idRegAtencion)
            return;
        this.isSubmitting.set(true);
        this.errorMessage.set('');
        const { tipo, descripcion } = this.motivoForm.value;
        const exito = await this.motivoService.crearMotivo(paciente.idRegAtencion, {
            idRegAtencion: paciente.idRegAtencion,
            tipo,
            descripcion,
        });
        this.isSubmitting.set(false);
        if (exito) {
            this.motivoForm.reset({ tipo: '', descripcion: '' });
            await this.cargarMotivos();
        }
        else {
            this.errorMessage.set('No se pudo registrar el motivo. Inténtalo de nuevo.');
        }
    }
    obtenerColorTipo(tipo) {
        const colores = {
            Emergencia: 'bg-red-100 text-red-700 border-red-200',
            Interconsulta: 'bg-purple-100 text-purple-700 border-purple-200',
            Postoperatorio: 'bg-orange-100 text-orange-700 border-orange-200',
            Control: 'bg-green-100 text-green-700 border-green-200',
            Seguimiento: 'bg-blue-100 text-blue-700 border-blue-200',
            Reevaluación: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Consulta: 'bg-teal-100 text-teal-700 border-teal-200',
        };
        return colores[tipo] ?? 'bg-slate-100 text-slate-700 border-slate-200';
    }
};
MotivoComponent = __decorate([
    Component({
        selector: 'app-motivo',
        standalone: true,
        imports: [CommonModule, ReactiveFormsModule, ErrorMensajeComponent],
        templateUrl: './motivo.html',
    })
], MotivoComponent);
export { MotivoComponent };
