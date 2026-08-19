import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  inject,
  Output,
  signal,
} from '@angular/core';
import { HeaderActionsService } from '../../servicios/header-actions.service';
@Component({
  selector: 'barra-superior',
  standalone: true,
  templateUrl: './barra-superior.html',
  imports: [NgTemplateOutlet],
})
export class BarraSuperior {
  headerActions = inject(HeaderActionsService);
  elementRef = inject(ElementRef);

  @Input() title: string = '';
  @Input() username: string | null = null;
  @Output() logoutEvent = new EventEmitter<void>();

  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update((estadoActual) => !estadoActual);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }
}
