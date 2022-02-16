import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[headerContentPrimary]'
})
export class HeaderContentPrimary {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
