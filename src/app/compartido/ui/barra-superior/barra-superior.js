import { __decorate } from "tslib";
import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, inject, Output, signal, } from '@angular/core';
import { HeaderActionsService } from '../../servicios/header-actions.service';
let BarraSuperior = class BarraSuperior {
    headerActions = inject(HeaderActionsService);
    elementRef = inject(ElementRef);
    title = '';
    username = null;
    logoutEvent = new EventEmitter();
    isMenuOpen = signal(false);
    toggleMenu() {
        this.isMenuOpen.update((estadoActual) => !estadoActual);
    }
    onClickOutside(event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isMenuOpen.set(false);
        }
    }
};
__decorate([
    Input()
], BarraSuperior.prototype, "title", void 0);
__decorate([
    Input()
], BarraSuperior.prototype, "username", void 0);
__decorate([
    Output()
], BarraSuperior.prototype, "logoutEvent", void 0);
__decorate([
    HostListener('document:click', ['$event'])
], BarraSuperior.prototype, "onClickOutside", null);
BarraSuperior = __decorate([
    Component({
        selector: 'barra-superior',
        standalone: true,
        templateUrl: './barra-superior.html',
        imports: [NgTemplateOutlet],
    })
], BarraSuperior);
export { BarraSuperior };
