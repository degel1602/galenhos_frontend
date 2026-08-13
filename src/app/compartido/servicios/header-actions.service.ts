import { Injectable, TemplateRef, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderActionsService {
  readonly template = signal<TemplateRef<unknown> | null>(null);

  setTemplate(tpl: TemplateRef<unknown> | null) {
    this.template.set(tpl);
  }
}