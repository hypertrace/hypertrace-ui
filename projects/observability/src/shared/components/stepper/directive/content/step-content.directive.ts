import { Directive, Input, OnChanges, TemplateRef } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { Step } from '../../step';
import { StepContentContext } from '../../stepper';

@Directive({
  selector: '[htStepContent]'
})
export class StepContentDirective implements OnChanges {
  @Input('htStepContentName')
  public name: string = '';

  public readonly step: Step = new Step();

  public constructor(public readonly templateRef: TemplateRef<StepContentContext>) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.name && this.name) {
      this.step.name = this.name;
    }
  }
}
