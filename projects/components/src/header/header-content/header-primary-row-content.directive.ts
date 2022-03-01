import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htHeaderPrimaryRowContent]'
})
export class HeaderPrimaryRowContentDirective {
  public constructor(public templateRef: TemplateRef<unknown>) {}
}
