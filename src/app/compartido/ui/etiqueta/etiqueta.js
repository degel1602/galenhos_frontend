import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
let Etiqueta = class Etiqueta {
    variante = 'neutral';
    claseAdicional = '';
    clases = {
        success: 'bg-[#d1fae5] text-[#047857]',
        warning: 'bg-[#fef3c7] text-[#b45309]',
        danger: 'bg-[#fee2e2] text-[#dc2626]',
        info: 'bg-[#e0e7ff] text-[#3730a3]',
        neutral: 'bg-[#e2e8f0] text-[#475569]',
        blue: 'bg-[#dbeafe] text-[#1d4ed8]',
    };
};
__decorate([
    Input()
], Etiqueta.prototype, "variante", void 0);
__decorate([
    Input()
], Etiqueta.prototype, "claseAdicional", void 0);
Etiqueta = __decorate([
    Component({
        selector: 'etiqueta',
        templateUrl: './etiqueta.html',
    })
], Etiqueta);
export { Etiqueta };
