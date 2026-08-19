import { __decorate } from "tslib";
import { Component, EventEmitter, Input, inject, Output, signal, } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../modulos/auth/aplicacion/auth.service';
import { IconoRuta } from '../icono-ruta/icono-ruta';
let BarraLateral = class BarraLateral {
    username = null;
    isCollapsed = false;
    toggleSidebarEvent = new EventEmitter();
    authService = inject(AuthService);
    expandedGroups = signal({});
    get menus() {
        return this.authService.menus();
    }
    get permisos() {
        return this.authService.permisos();
    }
    getPermisosPorGrupo(idListGrupo) {
        return this.permisos.filter((p) => p.idListGrupo === idListGrupo && p.opciones !== '*');
    }
    toggleGroup(idListGrupo) {
        if (this.isCollapsed)
            return;
        this.expandedGroups.update((state) => ({
            ...state,
            [idListGrupo]: !state[idListGrupo],
        }));
    }
    isGroupExpanded(idListGrupo) {
        return !!this.expandedGroups()[idListGrupo];
    }
};
__decorate([
    Input()
], BarraLateral.prototype, "username", void 0);
__decorate([
    Input()
], BarraLateral.prototype, "isCollapsed", void 0);
__decorate([
    Output()
], BarraLateral.prototype, "toggleSidebarEvent", void 0);
BarraLateral = __decorate([
    Component({
        selector: 'barra-lateral',
        imports: [RouterLink, RouterLinkActive, IconoRuta],
        templateUrl: './barra-lateral.html',
    })
], BarraLateral);
export { BarraLateral };
