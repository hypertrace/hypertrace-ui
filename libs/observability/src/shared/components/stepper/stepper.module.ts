import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule, IconModule, LetAsyncModule, SpinnerModule, TooltipModule } from '@hypertrace/components';
import { StepContentsComponent } from './contents/step-contents.component';
import { StepContentDirective } from './directive/content/step-content.directive';
import { StepSummaryFooterSectionDirective } from './directive/footer/step-summary-footer-section.directive';
import { StepSummaryHeaderSectionDirective } from './directive/footer/step-summary-header-section.directive';
import { StepperComponent } from './stepper.component';
import { StepSummariesModule } from './summary/step-summaries.module';

@NgModule({
  imports: [CommonModule, ButtonModule, IconModule, StepSummariesModule, SpinnerModule, LetAsyncModule, TooltipModule],
  declarations: [
    StepContentDirective,
    StepperComponent,
    StepContentsComponent,
    StepSummaryFooterSectionDirective,
    StepSummaryHeaderSectionDirective
  ],
  exports: [
    StepperComponent,
    StepContentDirective,
    StepSummaryFooterSectionDirective,
    StepSummaryHeaderSectionDirective
  ]
})
export class StepperModule {}
