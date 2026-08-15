import { Injectable, signal } from '@angular/core';

export type TipoModalGlobal = 'confirmar' | 'exito' | 'error' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ModalGlobalService {
  public readonly abierto = signal<boolean>(false);
  public readonly tipo = signal<TipoModalGlobal>('info');
  public readonly titulo = signal<string>('');
  public readonly mensaje = signal<string>('');
  public readonly etiquetaConfirmar = signal<string>('Confirmar');

  private resolverConfirmacion: ((resultado: boolean) => void) | null = null;

  confirmar(mensaje: string, titulo = 'Confirmación', etiquetaConfirmar = 'Confirmar'): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.resolverConfirmacion = resolve;
      this.tipo.set('confirmar');
      this.titulo.set(titulo);
      this.mensaje.set(mensaje);
      this.etiquetaConfirmar.set(etiquetaConfirmar);
      this.abierto.set(true);
    });
  }

  exito(mensaje: string, titulo = 'Operación exitosa'): void {
    this.tipo.set('exito');
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.abierto.set(true);
  }

  error(mensaje: string, titulo = 'Ocurrió un error'): void {
    this.tipo.set('error');
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.abierto.set(true);
  }

  info(mensaje: string, titulo = 'Aviso'): void {
    this.tipo.set('info');
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.abierto.set(true);
  }

  aceptar(): void {
    this.cerrar(true);
  }

  cancelar(): void {
    this.cerrar(false);
  }

  private cerrar(resultado: boolean): void {
    this.abierto.set(false);
    if (this.resolverConfirmacion) {
      const resolver = this.resolverConfirmacion;
      this.resolverConfirmacion = null;
      resolver(resultado);
    }
  }
}