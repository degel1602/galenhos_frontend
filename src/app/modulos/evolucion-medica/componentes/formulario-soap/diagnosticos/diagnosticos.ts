import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-diagnosticos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm">
      <h3 class="text-sm font-semibold text-teal-950 flex items-center gap-2 mb-2">
        <span class="w-1 h-3.5 bg-amber-500 rounded-sm inline-block"></span>
        Diagnósticos
      </h3>
      <p class="text-slate-500 text-[12.5px] mb-4">Incluya diagnóstico principal, secundarios, nuevos y descartados. Cada uno con código CIE-10, tipo, condición y estado.</p>
      
      <div class="overflow-x-auto border border-slate-200 rounded-lg">
        <table class="w-full text-[13px] text-left border-collapse min-w-[700px]">
          <thead>
            <tr class="bg-slate-50 border-b-2 border-slate-200">
              <th class="w-[100px] text-[10.8px] uppercase tracking-wider text-slate-500 p-2 font-semibold">CIE-10</th>
              <th class="text-[10.8px] uppercase tracking-wider text-slate-500 p-2 font-semibold">Descripción</th>
              <th class="text-[10.8px] uppercase tracking-wider text-slate-500 p-2 font-semibold">Tipo</th>
              <th class="text-[10.8px] uppercase tracking-wider text-slate-500 p-2 font-semibold">Condición</th>
              <th class="text-[10.8px] uppercase tracking-wider text-slate-500 p-2 font-semibold">Estado</th>
              <th class="w-[40px]"></th>
            </tr>
          </thead>
          <tbody>
            @for (dx of formArray.controls; track $index) {
              <tr class="border-b border-slate-100 group" [formGroup]="$any(dx)">
                <td class="p-1.5 align-top">
                  <input type="text" formControlName="cie10" class="w-full border border-slate-200 rounded-md p-1.5 font-mono text-[12.5px] bg-slate-50 text-slate-800 focus:ring-1 focus:ring-teal-600 focus:outline-none" placeholder="A00.0">
                </td>
                <td class="p-1.5 align-top">
                  <input type="text" formControlName="descripcion" class="w-full border border-slate-200 rounded-md p-1.5 text-[12.5px] bg-slate-50 text-slate-800 focus:ring-1 focus:ring-teal-600 focus:outline-none" placeholder="Descripción del diagnóstico">
                </td>
                <td class="p-1.5 align-top">
                  <select formControlName="tipo" class="w-full border border-slate-200 rounded-md p-1.5 text-[12.5px] bg-slate-50 text-slate-800 focus:ring-1 focus:ring-teal-600 focus:outline-none">
                    <option value="Presuntivo">Presuntivo</option>
                    <option value="Definitivo">Definitivo</option>
                  </select>
                </td>
                <td class="p-1.5 align-top">
                  <select formControlName="condicion" class="w-full border border-slate-200 rounded-md p-1.5 text-[12.5px] bg-slate-50 text-slate-800 focus:ring-1 focus:ring-teal-600 focus:outline-none">
                    <option value="Principal">Principal</option>
                    <option value="Secundario">Secundario</option>
                  </select>
                </td>
                <td class="p-1.5 align-top">
                  <select formControlName="estado" class="w-full border border-slate-200 rounded-md p-1.5 text-[12.5px] bg-slate-50 text-slate-800 focus:ring-1 focus:ring-teal-600 focus:outline-none">
                    <option value="Activo">Activo</option>
                    <option value="Resuelto">Resuelto</option>
                    <option value="Descartado">Descartado</option>
                  </select>
                </td>
                <td class="p-1.5 align-middle text-center">
                  <button (click)="removerDx($index)" class="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100" title="Eliminar fila">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <button (click)="agregarDx()" class="mt-3 bg-teal-50 text-teal-800 border border-dashed border-teal-600 hover:bg-teal-100 font-semibold py-1.5 px-4 rounded-md text-[12.6px] transition-colors">
        + Agregar diagnóstico
      </button>
    </div>
  `
})
export class DiagnosticosComponent {
  @Input({required: true}) formArray!: FormArray;
  private fb = inject(FormBuilder);

  agregarDx() {
    this.formArray.push(this.fb.group({
      cie10: [''],
      descripcion: [''],
      tipo: ['Presuntivo'],
      condicion: ['Secundario'],
      estado: ['Activo']
    }));
  }

  removerDx(index: number) {
    this.formArray.removeAt(index);
  }
}
