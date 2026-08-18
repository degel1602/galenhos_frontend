import { Directive, Input, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appColumnaTemplate]',
  standalone: true,
})
export class ColumnaTemplateDirective {
  @Input('appColumnaTemplate') nombreColumna!: string;

  public template = inject(TemplateRef<unknown>);
}
