import { Injectable, TemplateRef, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderActionsService {
  readonly template = signal<TemplateRef<any> | null>(null);

  setTemplate(tpl: TemplateRef<any> | null) {
    this.template.set(tpl);
  }
}
