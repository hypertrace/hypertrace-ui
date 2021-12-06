import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import { Step } from '../step';
import { StepSummaryFooterDirective } from './directives/step-summary-footer.directive';
import { StepSummaryHeaderDirective } from './directives/step-summary-header.directive';

@Component({
  selector: 'ht-step-summaries',
  styleUrls: ['./step-summaries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-summaries">
      <div *ngIf="this.stepSummaryHeader" class="summary-header">
        <ng-container *ngTemplateOutlet="this.stepSummaryHeader?.getTemplateRef()"></ng-container>
      </div>
      <div class="summaries">
        <ht-step-summary
          class="summary"
          *ngFor="let step of this.steps; let position = index"
          [position]="position + 1"
          [step]="step"
        ></ht-step-summary>
      </div>
      <div *ngIf="this.stepSummaryFooter" class="footer">
        <ng-container *ngTemplateOutlet="this.stepSummaryFooter!.getTemplateRef()"></ng-container>
      </div>
    </div>
  `
})
export class StepSummariesComponent {
  @Input()
  public steps: Step[] = [];

  @ContentChild(StepSummaryFooterDirective)
  public readonly stepSummaryFooter?: StepSummaryFooterDirective;

  @ContentChild(StepSummaryHeaderDirective)
  public readonly stepSummaryHeader?: StepSummaryHeaderDirective;
}
