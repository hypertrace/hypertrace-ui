import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htHeaderContentPrimary]'
})
export class HeaderContentPrimaryDirective {
  public constructor(public templateRef: TemplateRef<unknown>) {}
}
