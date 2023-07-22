import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htSelectOptionRenderer]'
})
export class SelectOptionRendererDirective {
  public constructor(private readonly templateRef: TemplateRef<unknown>) {}

  public getTemplateRef(): TemplateRef<unknown> {
    return this.templateRef;
  }
}
