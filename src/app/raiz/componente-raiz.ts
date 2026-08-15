import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalGlobalComponent } from '../compartido/ui/modal-global/modal-global';

@Component({
  selector: 'componente-raiz',
  imports: [RouterOutlet, ModalGlobalComponent],
  templateUrl: './componente-raiz.html'
})
export class ComponenteRaiz {
  title = 'front-galenos';
}
