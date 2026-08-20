import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject, } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, } from '@angular/forms';
import { AuthService } from '../../../../auth/aplicacion/auth.service';
import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';
import { TablaComponent, } from '../../../../../compartido/componentes/tabla/tabla.component';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';
let DiagnosticosComponent = class DiagnosticosComponent {
    formArray;
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    columnasDiagnosticos = [
        { campo: 'cie10Custom', cabecera: 'CIE-10', ancho: '100px' },
        { campo: 'descripcionCustom', cabecera: 'Descripción' },
        { campo: 'tipoCustom', cabecera: 'Tipo' },
        { campo: 'condicionCustom', cabecera: 'Condición' },
        { campo: 'estadoCustom', cabecera: 'Estado' },
        {
            campo: 'accionesCustom',
            cabecera: '',
            alineacion: 'center',
            ancho: '40px',
        },
    ];
    agregarDx() {
        this.formArray.push(this.fb.group({
            cie10: [''],
            descripcion: [''],
            tipo: ['Presuntivo'],
            condicion: ['Secundario'],
            estado: ['Activo'],
        }));
    }
    removerDx(index) {
        this.formArray.removeAt(index);
    }
};
__decorate([
    Input({ required: true })
], DiagnosticosComponent.prototype, "formArray", void 0);
DiagnosticosComponent = __decorate([
    Component({
        selector: 'app-diagnosticos',
        standalone: true,
        imports: [
            CommonModule,
            ReactiveFormsModule,
            ErrorMensajeComponent,
            TablaComponent,
            ColumnaTemplateDirective,
        ],
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './diagnosticos.html',
    })
], DiagnosticosComponent);
export { DiagnosticosComponent };
