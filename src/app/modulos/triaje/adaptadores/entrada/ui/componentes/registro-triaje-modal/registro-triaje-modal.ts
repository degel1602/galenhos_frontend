import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentanaModal } from '../../../../../../../compartido/ui/ventana-modal/ventana-modal';
import { RegistroTriajeService } from './registro-triaje.service';

@Component({
  selector: 'app-registro-triaje-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, VentanaModal],
  providers: [RegistroTriajeService],
  templateUrl: './registro-triaje-modal.html'
})
export class RegistroTriajeModal implements OnInit {
  @Input() abierto = false;
  @Output() alCerrar = new EventEmitter<void>();
  @Output() triajeIniciado = new EventEmitter<void>();

  public readonly srv = inject(RegistroTriajeService);

  ngOnInit(): void {
    void this.srv.cargarCatalogosIniciales();
  }

  cerrar(): void {
    this.srv.limpiarEstado();
    this.alCerrar.emit();
  }

  buscarPaciente(): void {
    this.srv.buscarPaciente();
  }

  cargarProvincias(): void {
    this.srv.formulario.idProvinciaDomicilio = '';
    this.srv.formulario.idDistritoDomicilio = '';
    this.srv.formulario.idCentroPobladoDomicilio = '';
    this.srv.cargarProvincias();
  }

  cargarDistritos(): void {
    this.srv.formulario.idDistritoDomicilio = '';
    this.srv.formulario.idCentroPobladoDomicilio = '';
    this.srv.cargarDistritos();
  }

  cargarCentrosPoblados(): void {
    this.srv.formulario.idCentroPobladoDomicilio = '';
    this.srv.cargarCentrosPoblados();
  }

  async continuarTriaje(): Promise<void> {
    await this.srv.guardarYContinuar();
    if (!this.srv.mensajeError) {
      this.triajeIniciado.emit();
      this.cerrar();
    }
  }
}
