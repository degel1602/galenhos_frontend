import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { __decorate } from 'tslib';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';

let SignosVitalesComponent = class SignosVitalesComponent {
  form;
  sub;
  ngOnInit() {
    this.sub = this.form.valueChanges.subscribe((val) => {
      const p = val.peso;
      const t = val.talla;
      if (p && t && t > 0) {
        this.form.patchValue(
          { imc: (p / (t * t)).toFixed(2) },
          { emitEvent: false },
        );
      } else {
        this.form.patchValue({ imc: '—' }, { emitEvent: false });
      }
    });
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
};
__decorate(
  [Input({ required: true })],
  SignosVitalesComponent.prototype,
  'form',
  void 0,
);
SignosVitalesComponent = __decorate(
  [
    Component({
      selector: 'app-signos-vitales',
      standalone: true,
      imports: [CommonModule, ReactiveFormsModule, ErrorMensajeComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
      templateUrl: './signos-vitales.html',
    }),
  ],
  SignosVitalesComponent,
);

export { SignosVitalesComponent };
