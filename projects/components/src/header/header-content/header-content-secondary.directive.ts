import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htHeaderContentSecondary]'
})
export class HeaderContentSecondaryDirective {
  public constructor(public templateRef: TemplateRef<unknown>) {}
}
