import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject, } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, } from '@angular/forms';
import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';
import { TablaComponent, } from '../../../../../compartido/componentes/tabla/tabla.component';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';
import { AuthService } from '../../../../auth/aplicacion/auth.service';
let PlanTratamientoComponent = class PlanTratamientoComponent {
    formGroup;
    authService = inject(AuthService);
    fb = inject(FormBuilder);
    columnasMedicamentos = [
        { campo: 'medicamentoCustom', cabecera: 'Medicamento / Insumo' },
        { campo: 'dosisCustom', cabecera: 'Dosis / Cantidad' },
        { campo: 'frecuenciaCustom', cabecera: 'Frecuencia' },
        { campo: 'viaCustom', cabecera: 'Vía de admin.' },
        { campo: 'duracionCustom', cabecera: 'Duración' },
        { campo: 'accionesCustom', cabecera: '', alineacion: 'center' },
    ];
    get farmacologicoArray() {
        return this.formGroup.get('farmacologico');
    }
    get procedimientosIndicadosGroup() {
        return this.formGroup.get('procedimientosIndicados');
    }
    get examenesGroup() {
        return this.formGroup.get('solicitudExamenes');
    }
    get interconsultasGroup() {
        return this.formGroup.get('interconsultas');
    }
    get indicacionesGroup() {
        return this.formGroup.get('indicacionesGenerales');
    }
    agregarMedicamento() {
        this.farmacologicoArray.push(this.fb.group({
            medicamento: [''],
            dosis: [''],
            frecuencia: [''],
            via: ['Oral'],
            duracion: [''],
        }));
    }
    removerMedicamento(index) {
        this.farmacologicoArray.removeAt(index);
    }
    getFormGroup(index) {
        return this.farmacologicoArray.at(index);
    }
};
__decorate([
    Input({ required: true })
], PlanTratamientoComponent.prototype, "formGroup", void 0);
PlanTratamientoComponent = __decorate([
    Component({
        selector: 'app-plan-tratamiento',
        standalone: true,
        imports: [
            CommonModule,
            ReactiveFormsModule,
            ErrorMensajeComponent,
            TablaComponent,
            ColumnaTemplateDirective,
        ],
        templateUrl: './plan-tratamiento.html',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
], PlanTratamientoComponent);
export { PlanTratamientoComponent };
