import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'componente-raiz',
  imports: [RouterOutlet],
  templateUrl: './componente-raiz.html'
})
export class ComponenteRaiz {
  title = 'front-galenos';
}
