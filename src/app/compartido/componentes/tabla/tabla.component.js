import { CommonModule } from '@angular/common';
import { Component, ContentChildren, Input } from '@angular/core';
import { __decorate } from 'tslib';
import { ColumnaTemplateDirective } from './columna-template.directive';

let TablaComponent = class TablaComponent {
  columnas = [];
  datos = [];
  cargando = false;
  mensajeCargando = 'Consultando...';
  mostrarFiltroRequerido = false;
  mensajeFiltroRequerido = 'Realice una búsqueda para ver resultados.';
  mensajeVacio = 'No se encontraron resultados.';
  templates;
  getTemplate(nombreColumna) {
    if (!this.templates) return null;
    const directiva = this.templates.find(
      (t) => t.nombreColumna === nombreColumna,
    );
    return directiva ? directiva.template : null;
  }
};
__decorate([Input()], TablaComponent.prototype, 'columnas', void 0);
__decorate([Input()], TablaComponent.prototype, 'datos', void 0);
__decorate([Input()], TablaComponent.prototype, 'cargando', void 0);
__decorate([Input()], TablaComponent.prototype, 'mensajeCargando', void 0);
__decorate(
  [Input()],
  TablaComponent.prototype,
  'mostrarFiltroRequerido',
  void 0,
);
__decorate(
  [Input()],
  TablaComponent.prototype,
  'mensajeFiltroRequerido',
  void 0,
);
__decorate([Input()], TablaComponent.prototype, 'mensajeVacio', void 0);
__decorate(
  [ContentChildren(ColumnaTemplateDirective)],
  TablaComponent.prototype,
  'templates',
  void 0,
);
TablaComponent = __decorate(
  [
    Component({
      selector: 'app-tabla',
      standalone: true,
      imports: [CommonModule],
      templateUrl: './tabla.component.html',
    }),
  ],
  TablaComponent,
);

export { TablaComponent };
