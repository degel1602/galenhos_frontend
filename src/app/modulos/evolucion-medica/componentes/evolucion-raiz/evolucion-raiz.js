import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import { __decorate } from 'tslib';
import { HeaderActionsService } from '../../../../compartido/servicios/header-actions.service';
import { AuthService } from '../../../auth/aplicacion/auth.service';
import { EvolucionService } from '../../servicios/evolucion.service';
import { BandejaPacientesComponent } from '../bandeja-pacientes/bandeja-pacientes';
import { FormularioSoapComponent } from '../formulario-soap/formulario-soap';

let EvolucionRaizComponent = class EvolucionRaizComponent {
  evolucionService = inject(EvolucionService);
  headerActionsService = inject(HeaderActionsService);
  authService = inject(AuthService);
  headerActionsTpl;
  ngAfterViewInit() {
    setTimeout(() => {
      this.headerActionsService.setTemplate(this.headerActionsTpl);
    });
    this.evolucionService.cargarPacientes();
  }
  ngOnDestroy() {
    this.headerActionsService.setTemplate(null);
  }
};
__decorate(
  [ViewChild('headerActions')],
  EvolucionRaizComponent.prototype,
  'headerActionsTpl',
  void 0,
);
EvolucionRaizComponent = __decorate(
  [
    Component({
      selector: 'app-evolucion-raiz',
      standalone: true,
      imports: [
        CommonModule,
        BandejaPacientesComponent,
        FormularioSoapComponent,
      ],
      providers: [EvolucionService],
      changeDetection: ChangeDetectionStrategy.OnPush,
      host: { class: 'block' },
      styles: [':host { display: block; }'],
      templateUrl: './evolucion-raiz.html',
    }),
  ],
  EvolucionRaizComponent,
);

export { EvolucionRaizComponent };
