import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htTitledHeaderControl]'
})
export class TitledHeaderControlDirective {
  public constructor(private readonly templateRef: TemplateRef<unknown>) {}

  public getTemplateRef(): TemplateRef<unknown> {
    return this.templateRef;
  }
}
