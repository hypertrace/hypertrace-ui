import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htTabHeader]',
})
export class TabCustomHeaderDirective {
  public constructor(public tpl: TemplateRef<unknown>) {}
}
