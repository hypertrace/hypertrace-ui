import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htListViewKeyRenderer]'
})
export class ListViewKeyRendererDirective {
  public constructor(private readonly templateRef: TemplateRef<unknown>) {}

  public getTemplateRef(): TemplateRef<unknown> {
    return this.templateRef;
  }
}
