import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { AuthService } from '../../../modulos/auth/aplicacion/auth.service';
import { IconoRuta } from '../icono-ruta/icono-ruta';

@Component({
  selector: 'barra-lateral',
  imports: [RouterLink, RouterLinkActive, IconoRuta],
  templateUrl: './barra-lateral.html'
})
export class BarraLateral {
  @Input() username: string | null = null;
  @Input() isCollapsed: boolean = false;
  @Output() onToggleSidebar = new EventEmitter<void>();

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
