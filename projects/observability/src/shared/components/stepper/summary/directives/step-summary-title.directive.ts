import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htStepSummaryTitle]'
})
export class StepSummaryTitleDirective {
  public constructor(private readonly templateRef: TemplateRef<unknown>) {}

  public getTemplateRef(): TemplateRef<unknown> {
    return this.templateRef;
  }
}
