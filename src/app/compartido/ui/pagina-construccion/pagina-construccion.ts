import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-construccion',
  standalone: true,
  templateUrl: './pagina-construccion.html',
})
export class PaginaConstruccionComponent {
  private router = inject(Router);

  get ruta(): string {
    return this.router.url;
  }

  volver() {
    window.history.back();
  }

  irAlInicio() {
    this.router.navigate(['/dashboard']);
  }
}
