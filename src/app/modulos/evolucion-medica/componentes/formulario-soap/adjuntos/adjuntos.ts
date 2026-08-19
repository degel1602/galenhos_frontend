import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import {
  type FormArray,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

const MAX_TAMANO_BYTES = 10 * 1024 * 1024;
const EXTENSIONES_PERMITIDAS = ['jpg', 'jpeg', 'png', 'pdf'];

@Component({
  selector: 'app-adjuntos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adjuntos.html',
})
export class AdjuntosComponent {
  @Input({ required: true }) formArray!: FormArray;

  private readonly fb = inject(FormBuilder);

  public readonly arrastrando = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');
  public readonly leyendo = signal<boolean>(false);

  get adjuntosArray(): FormArray {
    return this.formArray;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = input.files ? Array.from(input.files) : [];
    this.procesarArchivos(archivos);
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    const archivos = event.dataTransfer
      ? Array.from(event.dataTransfer.files)
      : [];
    this.procesarArchivos(archivos);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
  }

  private async procesarArchivos(archivos: File[]): Promise<void> {
    this.errorMessage.set('');

    const invalidos = archivos.filter((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      return !EXTENSIONES_PERMITIDAS.includes(ext) || f.size > MAX_TAMANO_BYTES;
    });

    if (invalidos.length > 0) {
      this.errorMessage.set(
        'Solo se admiten JPG, PNG o PDF con un máximo de 10MB por archivo.',
      );
      return;
    }

    this.leyendo.set(true);
    for (const archivo of archivos) {
      const dataB64 = await this.leerArchivo(archivo);
      if (dataB64) {
        this.adjuntosArray.push(
          this.fb.group({
            nombre: [archivo.name],
            tipo: [archivo.type],
            tamano: [archivo.size],
            dataB64: [dataB64],
          }),
        );
      }
    }
    this.leyendo.set(false);
  }

  private leerArchivo(archivo: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(archivo);
    });
  }

  eliminarAdjunto(index: number): void {
    this.adjuntosArray.removeAt(index);
  }

  formatearTamano(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
}
