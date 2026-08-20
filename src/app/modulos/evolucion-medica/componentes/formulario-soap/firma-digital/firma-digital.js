import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal, ViewChild, } from '@angular/core';
let FirmaDigitalComponent = class FirmaDigitalComponent {
    canvasRef;
    firmaCambio = new EventEmitter();
    tieneFirma = signal(false);
    firmaImagen = signal(null);
    dibujando = signal(false);
    ctx;
    trazando = false;
    ngAfterViewInit() {
        const canvas = this.canvasRef.nativeElement;
        canvas.width = 600;
        canvas.height = 220;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        this.ctx = ctx;
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#1e293b';
    }
    onPointerDown(event) {
        if (this.firmaImagen())
            return;
        const canvas = this.canvasRef.nativeElement;
        canvas.setPointerCapture(event.pointerId);
        this.trazando = true;
        this.dibujando.set(true);
        const pos = this.obtenerPosicion(event);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }
    onPointerMove(event) {
        if (!this.trazando)
            return;
        const pos = this.obtenerPosicion(event);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        this.tieneFirma.set(true);
        this.firmaCambio.emit(this.canvasRef.nativeElement.toDataURL('image/png'));
    }
    onPointerUp(_event) {
        this.trazando = false;
        this.dibujando.set(false);
        if (this.tieneFirma()) {
            this.firmaCambio.emit(this.canvasRef.nativeElement.toDataURL('image/png'));
        }
    }
    obtenerPosicion(event) {
        const canvas = this.canvasRef.nativeElement;
        const rect = canvas.getBoundingClientRect();
        const escalaX = canvas.width / rect.width;
        const escalaY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * escalaX,
            y: (event.clientY - rect.top) * escalaY,
        };
    }
    limpiar() {
        const canvas = this.canvasRef.nativeElement;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.tieneFirma.set(false);
        this.firmaImagen.set(null);
        this.firmaCambio.emit(null);
    }
    onSubirImagen(event) {
        const input = event.target;
        const archivo = input.files?.[0];
        if (!archivo)
            return;
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
};
__decorate([
    ViewChild('canvasFirma')
], FirmaDigitalComponent.prototype, "canvasRef", void 0);
__decorate([
    Output()
], FirmaDigitalComponent.prototype, "firmaCambio", void 0);
FirmaDigitalComponent = __decorate([
    Component({
        selector: 'app-firma-digital',
        standalone: true,
        imports: [CommonModule],
        templateUrl: './firma-digital.html',
    })
], FirmaDigitalComponent);
export { FirmaDigitalComponent };
