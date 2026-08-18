import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appColumnaTemplate]',
  standalone: true
})
export class ColumnaTemplateDirective {
  @Input('appColumnaTemplate') nombreColumna!: string;

  constructor(public template: TemplateRef<any>) {}
}
