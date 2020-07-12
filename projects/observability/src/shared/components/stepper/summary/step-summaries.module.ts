import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule, SpinnerModule } from '@hypertrace/components';
import { StepSummaryFooterDirective } from './directives/step-summary-footer.directive';
import { StepSummaryHeaderDirective } from './directives/step-summary-header.directive';
import { StepSummariesComponent } from './step-summaries.component';
import { StepSummaryComponent } from './step/step-summary.component';

@NgModule({
  imports: [CommonModule, IconModule, SpinnerModule],
  declarations: [StepSummariesComponent, StepSummaryComponent, StepSummaryFooterDirective, StepSummaryHeaderDirective],
  exports: [StepSummariesComponent, StepSummaryComponent, StepSummaryFooterDirective, StepSummaryHeaderDirective]
})
export class StepSummariesModule {}
