import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[htStepSummaryFooter]'
})
export class StepSummaryFooterDirective {
  public constructor(private readonly templateRef: TemplateRef<unknown>) {}

  public getTemplateRef(): TemplateRef<unknown> {
    return this.templateRef;
  }
}
