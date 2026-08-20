import { __decorate } from "tslib";
import { Injectable, signal } from '@angular/core';
let HeaderActionsService = class HeaderActionsService {
    template = signal(null);
    setTemplate(tpl) {
        this.template.set(tpl);
    }
};
HeaderActionsService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], HeaderActionsService);
export { HeaderActionsService };
