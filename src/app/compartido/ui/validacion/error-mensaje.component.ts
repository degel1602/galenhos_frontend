import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { type AbstractControl, NgModel } from '@angular/forms';

@Component({
  selector: 'app-error-mensaje',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-mensaje.component.html',
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
