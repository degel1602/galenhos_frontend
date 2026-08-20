import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, } from '@angular/forms';
import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';
import { TablaComponent, } from '../../../../../compartido/componentes/tabla/tabla.component';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';
import { AuthService } from '../../../../auth/aplicacion/auth.service';
import { EvolucionService } from '../../../servicios/evolucion.service';
import { OrdenService, } from '../../../servicios/orden.service';
let OrdenesMedicasComponent = class OrdenesMedicasComponent {
    formGroup;
    ordenService = inject(OrdenService);
    evolucionService = inject(EvolucionService);
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    ordenesPrevias = signal([]);
    isLoading = signal(false);
    isSubmitting = signal(false);
    errorMessage = signal('');
    successMessage = signal('');
    sugerencias = signal([]);
    debounceTimer;
    columnasPrescripcion = [
        { campo: 'medicamentoCustom', cabecera: 'Medicamento y Presentación' },
        { campo: 'cantidadCustom', cabecera: 'Cantidad', ancho: '100px' },
        { campo: 'indicacionesCustom', cabecera: 'Indicaciones para el paciente' },
        {
            campo: 'accionesCustom',
            cabecera: '',
            alineacion: 'center',
            ancho: '60px',
        },
    ];
    columnasHistorial = [
        { campo: 'fechaCustom', cabecera: 'Fecha' },
        { campo: 'medicoCustom', cabecera: 'Médico' },
        { campo: 'observacionCustom', cabecera: 'Observación General' },
        { campo: 'itemsCustom', cabecera: 'Items de Receta' },
    ];
    ngOnInit() {
        this.cargarOrdenes();
    }
    async cargarOrdenes() {
        const paciente = this.evolucionService.activePatient();
        if (!paciente?.idRegAtencion)
            return;
        this.isLoading.set(true);
        this.errorMessage.set('');
        try {
            const datos = await this.ordenService.listarPorCuenta(paciente.idRegAtencion);
            this.ordenesPrevias.set(datos);
        }
        catch (error) {
            console.error('Error al cargar órdenes:', error);
            this.errorMessage.set('No se pudieron cargar las órdenes previas.');
        }
        finally {
            this.isLoading.set(false);
        }
    }
    async guardarOrden() {
        const paciente = this.evolucionService.activePatient();
        if (!paciente)
            return;
        this.errorMessage.set('');
        this.successMessage.set('');
        const detallesForm = this.prescripcionArray.value;
        const ordenData = this.ordenesGroup.value;
        if (!ordenData.detalle && detallesForm.length === 0) {
            this.errorMessage.set('Debe ingresar detalles de la orden o añadir prescripciones médicas.');
            return;
        }
        const detalles = detallesForm.filter((d) => d.idProducto);
        if (detallesForm.length > 0 && detalles.length === 0) {
            this.errorMessage.set('Seleccione cada medicamento desde el catálogo (escriba y elija el producto real).');
            return;
        }
        this.isSubmitting.set(true);
        const request = {
            idRegAtencion: paciente.idRegAtencion,
            observacion: `${ordenData.orden ? `[${ordenData.orden}] ` : ''}${ordenData.detalle || ''}`,
            detalles: detalles.map((d) => ({
                idProducto: d.idProducto,
                cantidad: d.cantidad || 1,
                indicaciones: d.indicaciones || '',
            })),
        };
        const success = await this.ordenService.crearOrden(request);
        this.isSubmitting.set(false);
        if (success) {
            this.successMessage.set('Orden médica creada exitosamente.');
            this.ordenesGroup.reset();
            this.prescripcionArray.clear();
            this.agregarPrescripcion();
            await this.cargarOrdenes();
            setTimeout(() => this.successMessage.set(''), 4000);
        }
        else {
            this.errorMessage.set('Hubo un error al crear la orden médica. Inténtalo nuevamente.');
        }
    }
    get ordenesGroup() {
        return this.formGroup.get('ordenesMedicas');
    }
    get prescripcionArray() {
        return this.formGroup.get('prescripcion');
    }
    agregarPrescripcion() {
        this.prescripcionArray.push(this.fb.group({
            idProducto: [null],
            medicamento: ['', Validators.required],
            cantidad: [null, Validators.required],
            indicaciones: [''],
        }));
    }
    removerPrescripcion(index) {
        this.prescripcionArray.removeAt(index);
        this.sugerencias.set([]);
    }
    getPrescripcionGroup(index) {
        return this.prescripcionArray.at(index);
    }
    buscarMedicamento(index) {
        clearTimeout(this.debounceTimer);
        const grupo = this.getPrescripcionGroup(index);
        const texto = (grupo.get('medicamento')?.value || '').trim();
        if (texto.length < 2) {
            this.sugerencias.set([]);
            return;
        }
        this.debounceTimer = setTimeout(async () => {
            const productos = await this.ordenService.buscarProductos(texto);
            this.sugerencias.set(productos);
        }, 300);
    }
    seleccionarProducto(index, producto) {
        const grupo = this.getPrescripcionGroup(index);
        grupo.patchValue({
            idProducto: producto.idProducto,
            medicamento: `${producto.nombre}${producto.presentacion ? ` - ${producto.presentacion}` : ''}`,
        });
        this.sugerencias.set([]);
    }
    cerrarSugerencias() {
        setTimeout(() => this.sugerencias.set([]), 200);
    }
};
__decorate([
    Input({ required: true })
], OrdenesMedicasComponent.prototype, "formGroup", void 0);
OrdenesMedicasComponent = __decorate([
    Component({
        selector: 'app-ordenes-medicas',
        standalone: true,
        imports: [
            CommonModule,
            ReactiveFormsModule,
            ErrorMensajeComponent,
            TablaComponent,
            ColumnaTemplateDirective,
        ],
        templateUrl: './ordenes-medicas.html',
    })
], OrdenesMedicasComponent);
export { OrdenesMedicasComponent };
