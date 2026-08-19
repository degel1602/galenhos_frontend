import { Directive, Input, inject, TemplateRef } from '@angular/core';
import { __decorate } from 'tslib';

let ColumnaTemplateDirective = class ColumnaTemplateDirective {
  nombreColumna;
  template = inject(TemplateRef);
};
__decorate(
  [Input('appColumnaTemplate')],
  ColumnaTemplateDirective.prototype,
  'nombreColumna',
  void 0,
);
ColumnaTemplateDirective = __decorate(
  [
    Directive({
      selector: '[appColumnaTemplate]',
      standalone: true,
    }),
  ],
  ColumnaTemplateDirective,
);

export { ColumnaTemplateDirective };
