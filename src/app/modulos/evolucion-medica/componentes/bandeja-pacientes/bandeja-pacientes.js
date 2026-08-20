import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColumnaTemplateDirective } from '../../../../compartido/componentes/tabla/columna-template.directive';
import { TablaComponent, } from '../../../../compartido/componentes/tabla/tabla.component';
import { BuscadorRangoFechas, } from '../../../../compartido/ui/buscador-rango-fechas/buscador-rango-fechas';
import { PaginacionComponent } from '../../../../compartido/ui/paginacion/paginacion';
import { EvolucionService, } from '../../servicios/evolucion.service';
import { VerEvolucionComponent } from './ver-evolucion/ver-evolucion';
let BandejaPacientesComponent = class BandejaPacientesComponent {
    evolucionService = inject(EvolucionService);
    evolucionesPaciente = signal([]);
    evolucionesCargando = signal(false);
    evolucionDetalle = signal(null);
    columnasEvoluciones = [
        { campo: 'numeroCustom', cabecera: 'N.º' },
        { campo: 'fechaCustom', cabecera: 'Fecha de firma' },
        { campo: 'medicoCustom', cabecera: 'Médico' },
        { campo: 'estadoCustom', cabecera: 'Estado' },
        { campo: 'accionesCustom', cabecera: 'Acciones' },
    ];
    constructor() {
        effect(() => {
            const paciente = this.evolucionService.activePatient();
            if (paciente) {
                this.cargarEvoluciones();
            }
        });
    }
    async cargarEvoluciones() {
        const paciente = this.evolucionService.activePatient();
        if (!paciente?.idRegAtencion)
            return;
        this.evolucionesCargando.set(true);
        try {
            const evoluciones = await this.evolucionService.listarEvoluciones(paciente.idRegAtencion);
            this.evolucionesPaciente.set(evoluciones);
        }
        finally {
            this.evolucionesCargando.set(false);
        }
    }
    verEvolucion(evolucion) {
        const decodificada = this.evolucionService.decodificarEvolucion(evolucion.dataB64);
        if (!decodificada)
            return;
        this.evolucionDetalle.set({
            ...evolucion,
            ...decodificada,
        });
    }
    cerrarDetalle() {
        this.evolucionDetalle.set(null);
    }
    obtenerMedico(evolucion) {
        const decodificada = this.evolucionService.decodificarEvolucion(evolucion.dataB64);
        return (decodificada?.cabecera
            ?.medicoTratante || `Empleado #${evolucion.idEmpleadoRegistra}`);
    }
    onBuscar(criterios) {
        this.evolucionService.patientSearch.set(criterios.filtro);
        this.evolucionService.fechaDesde.set(criterios.fechaDesde);
        this.evolucionService.fechaHasta.set(criterios.fechaHasta);
        this.evolucionService.cargarPacientes();
    }
    onLimpiar() {
        this.evolucionService.patientSearch.set('');
        this.evolucionService.fechaDesde.set('');
        this.evolucionService.fechaHasta.set('');
        this.evolucionService.cargarPacientes();
    }
};
BandejaPacientesComponent = __decorate([
    Component({
        selector: 'app-bandeja-pacientes',
        standalone: true,
        imports: [
            CommonModule,
            FormsModule,
            BuscadorRangoFechas,
            PaginacionComponent,
            VerEvolucionComponent,
            TablaComponent,
            ColumnaTemplateDirective,
        ],
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './bandeja-pacientes.html',
    })
], BandejaPacientesComponent);
export { BandejaPacientesComponent };
