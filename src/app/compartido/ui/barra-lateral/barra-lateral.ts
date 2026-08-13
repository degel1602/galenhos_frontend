import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { AuthService } from '../../../modulos/auth/aplicacion/auth.service';

@Component({
  selector: 'barra-lateral',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './barra-lateral.html'
})
export class BarraLateral {
  @Input() username: string | null = null;
  @Input() isCollapsed: boolean = false;

  authService = inject(AuthService);

  expandedGroups = signal<Record<number, boolean>>({});

  get menus() {
    return this.authService.menus();
  }

  get permisos() {
    return this.authService.permisos();
  }

  getPermisosPorGrupo(idListGrupo: number) {
    return this.permisos.filter(p => p.idListGrupo === idListGrupo && p.opciones !== '*');
  }

  toggleGroup(idListGrupo: number) {
    if (this.isCollapsed) return;
    this.expandedGroups.update(state => ({
      ...state,
      [idListGrupo]: !state[idListGrupo]
    }));
  }

  isGroupExpanded(idListGrupo: number): boolean {
    return !!this.expandedGroups()[idListGrupo];
  }
}
