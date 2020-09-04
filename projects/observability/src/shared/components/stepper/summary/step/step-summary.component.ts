import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { SubscriptionLifecycle, TypedSimpleChanges } from '@hypertrace/common';
import { SpinnerTheme } from '@hypertrace/components';
import { Step } from '../../step';

@Component({
  selector: 'ht-step-summary',
  providers: [SubscriptionLifecycle],
  styleUrls: ['./step-summary.component.scss'],
  template: `
    <div class="ht-step-summary" *ngIf="this.step">
      <div class="content">
        <div
          class="status"
          [ngClass]="{
            done: this.step.isCompleted(),
            'in-progress': !this.step.isCompleted(),
            'to-do': this.step.isIncomplete() && !this.step.isReadyForCompletion()
          }"
        ></div>
        <div class="title" *ngIf="this.position">Step {{ this.position }}</div>
        <div class="name">{{ this.step.name }}</div>
      </div>
      <div class="footer" *ngIf="this.step.subSteps.length > 0">
        <htc-spinner
          class="spinner"
          *ngFor="let subStep of this.step.subSteps"
          [data$]="subStep.status$"
          theme="${SpinnerTheme.Light}"
          [loadingLabel]="subStep.loadingLabel"
          [errorLabel]="subStep.errorLabel"
          [successLabel]="subStep.successLabel"
        ></htc-spinner>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepSummaryComponent implements OnChanges {
  @Input()
  public position?: number;

  @Input()
  public step?: Step;

  public constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly subscriptionLifecycle: SubscriptionLifecycle
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.step && this.step) {
      this.setStepChangeSubscription();
    }
  }

  private setStepChangeSubscription(): void {
    this.subscriptionLifecycle.unsubscribe();
    if (this.step) {
      this.subscriptionLifecycle.add(this.step.changes$.subscribe(() => this.changeDetector.detectChanges()));
    }
  }
}
