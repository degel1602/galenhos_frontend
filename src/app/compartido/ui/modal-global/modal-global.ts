import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalGlobalService } from './modal-global.service';

@Component({
  selector: 'modal-global',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-global.html'
})
export class ModalGlobalComponent {
  public readonly modal = inject(ModalGlobalService);
}