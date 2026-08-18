import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { type AbstractControl, NgModel } from '@angular/forms';

@Component({
  selector: 'app-error-mensaje',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="shouldShowErrors()" class="text-red-500 text-xs mt-1 font-medium transition-all duration-300">
      <span *ngIf="errors?.['required']">Este campo es requerido.</span>
      <span *ngIf="errors?.['minlength']">Mínimo {{ errors?.['minlength']?.requiredLength }} caracteres.</span>
      <span *ngIf="errors?.['maxlength']">Máximo {{ errors?.['maxlength']?.requiredLength }} caracteres.</span>
      <span *ngIf="errors?.['pattern']">El formato no es válido.</span>
      <span *ngIf="errors?.['email']">Ingrese un correo electrónico válido.</span>
      <span *ngIf="errors?.['min']">El valor mínimo es {{ errors?.['min']?.min }}.</span>
      <span *ngIf="errors?.['max']">El valor máximo es {{ errors?.['max']?.max }}.</span>
      <span *ngIf="errors?.['dniInvalido']">El DNI debe tener 8 dígitos numéricos.</span>
      <span *ngIf="errors?.['historiaInvalida']">Formato de historia clínica no válido.</span>
      <!-- Errores personalizados adicionales -->
      <span *ngIf="errors?.['mensajePersonalizado']">{{ errors?.['mensajePersonalizado'] }}</span>
    </div>
  `,
})
export class ErrorMensajeComponent {
  @Input() control!: AbstractControl | NgModel | null;
  @Input() forceShow: boolean = false;

  get errors() {
    if (this.control instanceof NgModel) {
      return this.control.control.errors;
    }
    return this.control?.errors;
  }

  shouldShowErrors(): boolean {
    if (!this.control) return false;

    if (this.control instanceof NgModel) {
      return (
        !!this.control.control.invalid &&
        (this.control.control.touched ||
          this.control.control.dirty ||
          this.forceShow)
      );
    }

    return (
      !!this.control.invalid &&
      (this.control.touched || this.control.dirty || this.forceShow)
    );
  }
}
