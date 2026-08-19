import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { __decorate } from 'tslib';
import { ModalGlobalComponent } from '../compartido/ui/modal-global/modal-global';

let ComponenteRaiz = class ComponenteRaiz {
  title = 'front-galenos';
};
ComponenteRaiz = __decorate(
  [
    Component({
      selector: 'componente-raiz',
      imports: [RouterOutlet, ModalGlobalComponent],
      templateUrl: './componente-raiz.html',
    }),
  ],
  ComponenteRaiz,
);

export { ComponenteRaiz };
