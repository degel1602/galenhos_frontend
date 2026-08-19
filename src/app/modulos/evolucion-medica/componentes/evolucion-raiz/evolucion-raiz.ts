import { CommonModule } from '@angular/common';
import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  type OnDestroy,
  type TemplateRef,
  ViewChild,
} from '@angular/core';
import { HeaderActionsService } from '../../../../compartido/servicios/header-actions.service';
import { AuthService } from '../../../auth/aplicacion/auth.service';
import { EvolucionService } from '../../servicios/evolucion.service';
import { BandejaPacientesComponent } from '../bandeja-pacientes/bandeja-pacientes';
import { FormularioSoapComponent } from '../formulario-soap/formulario-soap';

@Component({
  selector: 'app-evolucion-raiz',
  standalone: true,
  imports: [CommonModule, BandejaPacientesComponent, FormularioSoapComponent],
  providers: [EvolucionService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styles: [':host { display: block; }'],
  templateUrl: './evolucion-raiz.html',
})
export class EvolucionRaizComponent implements AfterViewInit, OnDestroy {
  evolucionService = inject(EvolucionService);
  headerActionsService = inject(HeaderActionsService);
  authService = inject(AuthService);

  @ViewChild('headerActions') headerActionsTpl!: TemplateRef<unknown>;

  ngAfterViewInit() {
    setTimeout(() => {
      this.headerActionsService.setTemplate(this.headerActionsTpl);
    });
    this.evolucionService.cargarPacientes();
  }

  ngOnDestroy() {
    this.headerActionsService.setTemplate(null);
  }
}
