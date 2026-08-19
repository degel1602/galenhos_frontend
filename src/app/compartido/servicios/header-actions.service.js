import { Injectable, signal } from '@angular/core';
import { __decorate } from 'tslib';

let HeaderActionsService = class HeaderActionsService {
  template = signal(null);
  setTemplate(tpl) {
    this.template.set(tpl);
  }
};
HeaderActionsService = __decorate(
  [
    Injectable({
      providedIn: 'root',
    }),
  ],
  HeaderActionsService,
);

export { HeaderActionsService };
