import { TemplateRef } from '@angular/core';
import { Step } from './step';

export interface StepDetail {
  step: Step;
  contentTemplate: TemplateRef<StepContentContext>;
}

export interface StepContentContext {
  step: Step;
  $implicit: Step;
}
