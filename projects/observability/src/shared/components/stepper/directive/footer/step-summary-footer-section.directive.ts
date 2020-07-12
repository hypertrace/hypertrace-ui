import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htStepSummaryFooterSection]'
})
export class StepSummaryFooterSectionDirective {
  public constructor(private readonly templateRef: TemplateRef<unknown>) {}

  public getTemplateRef(): TemplateRef<unknown> {
    return this.templateRef;
  }
}
