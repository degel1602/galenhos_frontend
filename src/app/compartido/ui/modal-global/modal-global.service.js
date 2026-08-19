import { Injectable, signal } from '@angular/core';
import { __decorate } from 'tslib';

let ModalGlobalService = class ModalGlobalService {
  abierto = signal(false);
  tipo = signal('info');
  titulo = signal('');
  mensaje = signal('');
  etiquetaConfirmar = signal('Confirmar');
  resolverConfirmacion = null;
  confirmar(mensaje, titulo = 'Confirmación', etiquetaConfirmar = 'Confirmar') {
    return new Promise((resolve) => {
      this.resolverConfirmacion = resolve;
      this.tipo.set('confirmar');
      this.titulo.set(titulo);
      this.mensaje.set(mensaje);
      this.etiquetaConfirmar.set(etiquetaConfirmar);
      this.abierto.set(true);
    });
  }
  exito(mensaje, titulo = 'Operación exitosa') {
    this.tipo.set('exito');
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.abierto.set(true);
  }
  error(mensaje, titulo = 'Ocurrió un error') {
    this.tipo.set('error');
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.abierto.set(true);
  }
  info(mensaje, titulo = 'Aviso') {
    this.tipo.set('info');
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.abierto.set(true);
  }
  aceptar() {
    this.cerrar(true);
  }
  cancelar() {
    this.cerrar(false);
  }
  cerrar(resultado) {
    this.abierto.set(false);
    if (this.resolverConfirmacion) {
      const resolver = this.resolverConfirmacion;
      this.resolverConfirmacion = null;
      resolver(resultado);
    }
  }
};
ModalGlobalService = __decorate(
  [
    Injectable({
      providedIn: 'root',
    }),
  ],
  ModalGlobalService,
);

export { ModalGlobalService };
