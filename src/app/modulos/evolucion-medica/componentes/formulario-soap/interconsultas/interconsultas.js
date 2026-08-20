import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, } from '@angular/forms';
import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';
import { TablaComponent, } from '../../../../../compartido/componentes/tabla/tabla.component';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';
import { AuthService } from '../../../../auth/aplicacion/auth.service';
import { EvolucionService } from '../../../servicios/evolucion.service';
import { InterconsultaService, } from '../../../servicios/interconsulta.service';
let InterconsultasComponent = class InterconsultasComponent {
    fb = inject(FormBuilder);
    interconsultaService = inject(InterconsultaService);
    evolucionService = inject(EvolucionService);
    authService = inject(AuthService);
    interconsultaForm = this.fb.group({
        idEspecialidad: ['', Validators.required],
        idMedicoDestino: [''],
        motivo: ['', [Validators.required, Validators.minLength(10)]],
    });
    interconsultas = signal([]);
    isLoading = signal(false);
    isSubmitting = signal(false);
    errorMessage = signal('');
    especialidades = signal([]);
    medicos = signal([]);
    medicosCargando = signal(false);
    get columnasInterconsultas() {
        const cols = [
            { campo: 'fechaCustom', cabecera: 'Fecha' },
            { campo: 'especialidadCustom', cabecera: 'Especialidad' },
            { campo: 'motivoCustom', cabecera: 'Motivo' },
            { campo: 'estadoCustom', cabecera: 'Estado' },
        ];
        if (this.authService.hasPermission('modificar')) {
            cols.push({ campo: 'accionesCustom', cabecera: 'Acciones' });
        }
        return cols;
    }
    ngOnInit() {
        this.cargarHistorial();
        this.cargarEspecialidades();
    }
    async cargarEspecialidades() {
        const lista = await this.interconsultaService.listarEspecialidades();
        this.especialidades.set(lista);
    }
    async cambiarEspecialidad(idEspecialidad) {
        this.interconsultaForm.patchValue({ idMedicoDestino: '' });
        this.medicos.set([]);
        if (!idEspecialidad)
            return;
        this.medicosCargando.set(true);
        const lista = await this.interconsultaService.listarMedicosPorEspecialidad(idEspecialidad);
        this.medicos.set(lista);
        this.medicosCargando.set(false);
    }
    onEspecialidadChange(event) {
        const valor = event.target.value;
        this.cambiarEspecialidad(valor ? Number(valor) : 0);
    }
    async cargarHistorial() {
        const paciente = this.evolucionService.activePatient();
        if (!paciente?.idRegAtencion)
            return;
        this.isLoading.set(true);
        this.errorMessage.set('');
        try {
            const datos = await this.interconsultaService.listarPorAtencion(paciente.idRegAtencion);
            this.interconsultas.set(datos);
        }
        catch {
            this.errorMessage.set('No se pudieron cargar las interconsultas previas.');
        }
        finally {
            this.isLoading.set(false);
        }
    }
    async solicitar() {
        if (this.interconsultaForm.invalid)
            return;
        const paciente = this.evolucionService.activePatient();
        const idAtencion = paciente?.idRegAtencion ?? 0;
        this.isSubmitting.set(true);
        const formData = this.interconsultaForm.value;
        const request = {
            idAtencionOrigen: idAtencion,
            idEspecialidad: Number(formData.idEspecialidad),
            idMedicoDestino: formData.idMedicoDestino
                ? Number(formData.idMedicoDestino)
                : 0,
            motivo: formData.motivo,
        };
        const exito = await this.interconsultaService.crear(request);
        this.isSubmitting.set(false);
        if (exito) {
            this.interconsultaForm.reset({
                idEspecialidad: '',
                idMedicoDestino: '',
                motivo: '',
            });
            this.medicos.set([]);
            await this.cargarHistorial();
        }
        else {
            this.errorMessage.set('Error al solicitar la interconsulta. Inténtalo de nuevo.');
        }
    }
    async atender(idInterconsulta) {
        const exito = await this.interconsultaService.actualizarEstado(idInterconsulta, 'En Progreso');
        if (exito) {
            await this.cargarHistorial();
        }
    }
    obtenerNombreEspecialidad(idEspecialidad) {
        const especialidad = this.especialidades().find((e) => e.idEspecialidad === idEspecialidad);
        return especialidad?.nombre ?? `Esp. #${idEspecialidad}`;
    }
};
InterconsultasComponent = __decorate([
    Component({
        selector: 'app-interconsultas',
        standalone: true,
        imports: [
            CommonModule,
            ReactiveFormsModule,
            ErrorMensajeComponent,
            TablaComponent,
            ColumnaTemplateDirective,
        ],
        templateUrl: './interconsultas.html',
    })
], InterconsultasComponent);
export { InterconsultasComponent };
