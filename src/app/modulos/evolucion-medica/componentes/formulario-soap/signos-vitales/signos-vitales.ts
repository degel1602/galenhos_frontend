import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signos-vitales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm" [formGroup]="form">
      <h3 class="text-sm font-semibold text-teal-950 flex items-center gap-2 mb-4">
        <span class="w-1 h-3.5 bg-amber-500 rounded-sm inline-block"></span>
        Signos vitales
      </h3>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        
        <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between hover:border-teal-400 transition-colors">
          <label class="text-[10.5px] font-semibold text-slate-500">Presión arterial</label>
          <div class="flex items-baseline mt-1">
            <input type="text" formControlName="presionArterial" class="bg-transparent border-none p-0 m-0 font-mono text-[16px] font-medium text-teal-900 w-full focus:ring-0" placeholder="120/80">
            <span class="text-[10.5px] text-slate-400 ml-1">mmHg</span>
          </div>
        </div>

        <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between hover:border-teal-400 transition-colors">
          <label class="text-[10.5px] font-semibold text-slate-500">Frec. cardíaca</label>
          <div class="flex items-baseline mt-1">
            <input type="number" formControlName="frecuenciaCardiaca" class="bg-transparent border-none p-0 m-0 font-mono text-[16px] font-medium text-teal-900 w-full focus:ring-0" placeholder="72">
            <span class="text-[10.5px] text-slate-400 ml-1">lpm</span>
          </div>
        </div>

        <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between hover:border-teal-400 transition-colors">
          <label class="text-[10.5px] font-semibold text-slate-500">Frec. respiratoria</label>
          <div class="flex items-baseline mt-1">
            <input type="number" formControlName="frecuenciaRespiratoria" class="bg-transparent border-none p-0 m-0 font-mono text-[16px] font-medium text-teal-900 w-full focus:ring-0" placeholder="16">
            <span class="text-[10.5px] text-slate-400 ml-1">rpm</span>
          </div>
        </div>

        <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between hover:border-teal-400 transition-colors">
          <label class="text-[10.5px] font-semibold text-slate-500">Temperatura</label>
          <div class="flex items-baseline mt-1">
            <input type="number" step="0.1" formControlName="temperatura" class="bg-transparent border-none p-0 m-0 font-mono text-[16px] font-medium text-teal-900 w-full focus:ring-0" placeholder="36.5">
            <span class="text-[10.5px] text-slate-400 ml-1">°C</span>
          </div>
        </div>

        <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between hover:border-teal-400 transition-colors">
          <label class="text-[10.5px] font-semibold text-slate-500">Saturación O₂</label>
          <div class="flex items-baseline mt-1">
            <input type="number" formControlName="saturacionOxigeno" class="bg-transparent border-none p-0 m-0 font-mono text-[16px] font-medium text-teal-900 w-full focus:ring-0" placeholder="98">
            <span class="text-[10.5px] text-slate-400 ml-1">%</span>
          </div>
        </div>

        <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between hover:border-teal-400 transition-colors">
          <label class="text-[10.5px] font-semibold text-slate-500">Peso</label>
          <div class="flex items-baseline mt-1">
            <input type="number" step="0.1" formControlName="peso" class="bg-transparent border-none p-0 m-0 font-mono text-[16px] font-medium text-teal-900 w-full focus:ring-0" placeholder="70">
            <span class="text-[10.5px] text-slate-400 ml-1">kg</span>
          </div>
        </div>

        <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between hover:border-teal-400 transition-colors">
          <label class="text-[10.5px] font-semibold text-slate-500">Talla</label>
          <div class="flex items-baseline mt-1">
            <input type="number" step="0.01" formControlName="talla" class="bg-transparent border-none p-0 m-0 font-mono text-[16px] font-medium text-teal-900 w-full focus:ring-0" placeholder="1.70">
            <span class="text-[10.5px] text-slate-400 ml-1">m</span>
          </div>
        </div>

        <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-100 flex flex-col justify-between cursor-not-allowed">
          <label class="text-[10.5px] font-semibold text-slate-400">IMC</label>
          <div class="flex items-baseline mt-1">
            <input type="text" readonly formControlName="imc" class="bg-transparent border-none p-0 m-0 font-mono text-[16px] font-medium text-slate-500 w-full focus:ring-0 cursor-not-allowed" placeholder="—">
            <span class="text-[10.5px] text-slate-400 ml-1">kg/m²</span>
          </div>
        </div>

        <div class="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between hover:border-teal-400 transition-colors">
          <label class="text-[10.5px] font-semibold text-slate-500">Glucemia</label>
          <div class="flex items-baseline mt-1">
            <input type="number" formControlName="glucemia" class="bg-transparent border-none p-0 m-0 font-mono text-[16px] font-medium text-teal-900 w-full focus:ring-0" placeholder="90">
            <span class="text-[10.5px] text-slate-400 ml-1">mg/dL</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SignosVitalesComponent implements OnInit, OnDestroy {
  @Input({required: true}) form!: FormGroup;
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.form.valueChanges.subscribe(val => {
      const p = val.peso;
      const t = val.talla;
      if (p && t && t > 0) {
        this.form.patchValue({ imc: (p / (t * t)).toFixed(2) }, { emitEvent: false });
      } else {
        this.form.patchValue({ imc: '—' }, { emitEvent: false });
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
