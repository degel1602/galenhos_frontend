import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { type FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { Subscription } from 'rxjs';

import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';

@Component({
  selector: 'app-signos-vitales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMensajeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signos-vitales.html',
})
export class SignosVitalesComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;
  private sub?: Subscription;

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
}
