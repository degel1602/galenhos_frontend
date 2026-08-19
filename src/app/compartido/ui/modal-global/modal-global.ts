import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ModalGlobalService } from './modal-global.service';

@Component({
  selector: 'modal-global',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-global.html',
})
export class ModalGlobalComponent {
  public readonly modal = inject(ModalGlobalService);
}
