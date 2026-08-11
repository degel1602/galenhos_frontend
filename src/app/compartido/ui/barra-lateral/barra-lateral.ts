import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Logotipo } from '../logotipo/logotipo';

@Component({
  selector: 'barra-lateral',
  imports: [RouterLink, RouterLinkActive, Logotipo],
  templateUrl: './barra-lateral.html'
})
export class BarraLateral {
  @Input() username: string | null = null;
  @Input() isCollapsed: boolean = false;
  @Output() onLogout = new EventEmitter<void>();

  initials(): string {
    return (this.username || 'GP').slice(0, 2).toUpperCase();
  }

  logout() {
    this.onLogout.emit();
  }
}
