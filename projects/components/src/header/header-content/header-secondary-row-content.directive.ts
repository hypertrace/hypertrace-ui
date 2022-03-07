import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htHeaderSecondaryRowContent]'
})
export class HeaderSecondaryRowContentDirective {
  public constructor(public readonly templateRef: TemplateRef<unknown>) {}
}
