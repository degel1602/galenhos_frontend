import { Component, ElementRef, ViewChild, Output, EventEmitter, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-firma-digital',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './firma-digital.html'
})
export class FirmaDigitalComponent implements AfterViewInit {
  @ViewChild('canvasFirma') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Output() firmaCambio = new EventEmitter<string | null>();

  public readonly tieneFirma = signal<boolean>(false);
  public readonly firmaImagen = signal<string | null>(null);
  public readonly dibujando = signal<boolean>(false);

  private ctx!: CanvasRenderingContext2D;
  private trazando = false;
  private ultimoX = 0;
  private ultimoY = 0;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = 600;
    canvas.height = 220;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#1e293b';
  }

  onPointerDown(event: PointerEvent): void {
    if (this.firmaImagen()) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.setPointerCapture(event.pointerId);
    this.trazando = true;
    this.dibujando.set(true);
    const pos = this.obtenerPosicion(event);
    this.ultimoX = pos.x;
    this.ultimoY = pos.y;
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.trazando) return;
    const pos = this.obtenerPosicion(event);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.ultimoX = pos.x;
    this.ultimoY = pos.y;
    this.tieneFirma.set(true);
    this.firmaCambio.emit(this.canvasRef.nativeElement.toDataURL('image/png'));
  }

  onPointerUp(event: PointerEvent): void {
    this.trazando = false;
    this.dibujando.set(false);
    if (this.tieneFirma()) {
      this.firmaCambio.emit(this.canvasRef.nativeElement.toDataURL('image/png'));
    }
  }

  private obtenerPosicion(event: PointerEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * escalaX,
      y: (event.clientY - rect.top) * escalaY
    };
  }

  limpiar(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.tieneFirma.set(false);
    this.firmaImagen.set(null);
    this.firmaCambio.emit(null);
  }

  onSubirImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      this.firmaImagen.set(dataUrl);
      this.tieneFirma.set(true);
      this.firmaCambio.emit(dataUrl);
    };
    reader.readAsDataURL(archivo);
    input.value = '';
  }
}