import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htListViewValueRenderer]'
})
export class ListViewValueRendererDirective {
  public constructor(private readonly templateRef: TemplateRef<unknown>) {}

  public getTemplateRef(): TemplateRef<unknown> {
    return this.templateRef;
  }
}
