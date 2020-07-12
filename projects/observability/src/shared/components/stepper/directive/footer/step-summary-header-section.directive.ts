import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htStepSummaryHeaderSection]'
})
export class StepSummaryHeaderSectionDirective {
  public constructor(private readonly templateRef: TemplateRef<unknown>) {}

  public getTemplateRef(): TemplateRef<unknown> {
    return this.templateRef;
  }
}
