import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { __decorate } from 'tslib';

let ErrorMensajeComponent = class ErrorMensajeComponent {
  control;
  forceShow = false;
  get errors() {
    if (this.control instanceof NgModel) {
      return this.control.control.errors;
    }
    return this.control?.errors;
  }
  shouldShowErrors() {
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
};
__decorate([Input()], ErrorMensajeComponent.prototype, 'control', void 0);
__decorate([Input()], ErrorMensajeComponent.prototype, 'forceShow', void 0);
ErrorMensajeComponent = __decorate(
  [
    Component({
      selector: 'app-error-mensaje',
      standalone: true,
      imports: [CommonModule],
      templateUrl: './error-mensaje.component.html',
    }),
  ],
  ErrorMensajeComponent,
);

export { ErrorMensajeComponent };
