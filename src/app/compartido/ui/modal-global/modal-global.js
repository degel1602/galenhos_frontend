import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { __decorate } from 'tslib';
import { ModalGlobalService } from './modal-global.service';

let ModalGlobalComponent = class ModalGlobalComponent {
  modal = inject(ModalGlobalService);
};
ModalGlobalComponent = __decorate(
  [
    Component({
      selector: 'modal-global',
      standalone: true,
      imports: [CommonModule],
      templateUrl: './modal-global.html',
    }),
  ],
  ModalGlobalComponent,
);

export { ModalGlobalComponent };
