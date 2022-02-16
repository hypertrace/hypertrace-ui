import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[headerContentSecondary]'
})
export class HeaderContentSecondary {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
