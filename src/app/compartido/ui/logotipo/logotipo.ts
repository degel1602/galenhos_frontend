import { Component, Input } from '@angular/core';

@Component({
  selector: 'logotipo',
  templateUrl: './logotipo.html',
})
export class Logotipo {
  @Input() size: number = 24;
}
