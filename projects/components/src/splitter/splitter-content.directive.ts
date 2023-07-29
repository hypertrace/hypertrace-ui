import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htSplitterContent]'
})
export class SplitterContentDirective {
  public constructor(public readonly templateRef: TemplateRef<unknown>) {}
}
